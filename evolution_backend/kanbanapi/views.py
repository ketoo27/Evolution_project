# kanbanapi/views.py
import datetime
from datetime import date, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, generics,permissions # Removed serializers import, added viewsets
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
from django.db import IntegrityError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from .serializers import UserRegistrationSerializer, TaskCardSerializer, HabitListSerializer, HabitTrackerSerializer, EventSerializer, JournalEntrySerializer, BadgeSerializer, UserBadgeSerializer,UserProfileUpdateSerializer # <---- Import serializers from serializers.py
from .models import TaskCard, HabitList, HabitTracker, Event, JournalEntry, Badge, UserBadge
from django.utils import timezone
from .badges_logic import check_and_award_badges
from django.db.models import Count, Case, When, DateField
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser # Make sure these are imported
from collections import defaultdict




User = get_user_model()

class UserRegistrationView(APIView):
    """
    API view for user registration.
    Allows new users to create an account.
    """
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        """
        Handles POST requests to register a new user with detailed error messages.
        """
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            try:
                user = serializer.save()
                token = Token.objects.create(user=user)
                return Response(
                    {'message': 'User registered successfully!', 'token': token.key},
                    status=status.HTTP_201_CREATED
                )
            except IntegrityError as e:
                errors = {}
                if 'unique constraint' in str(e).lower() and 'username' in str(e).lower():
                    errors['username'] = "Username is already taken."
                elif 'unique constraint' in str(e).lower() and 'email' in str(e).lower():
                    errors['email'] = "Email address is already registered."
                else:
                    errors['non_field_error'] = ["Could not register user due to a database error."]
                return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """
    API view for user login.
    Authenticates user and returns an authentication token.
    """
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, username=username, password=password)

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)

            # --- Habit Tracking Logic Start ---
            today_date = datetime.date.today()
            yesterday_date = today_date - datetime.timedelta(days=1)

            # 1. Delete previous day's habit task cards
            previous_day_habit_tasks = TaskCard.objects.filter(
                user=user,
                is_habit=True,
                due_date__lt=today_date
            )
            deleted_count, _ = previous_day_habit_tasks.delete()
            if deleted_count > 0:
                print(f"Deleted {deleted_count} habit task(s) from {yesterday_date} for user {user.username}.")

            last_tracker_entry = HabitTracker.objects.filter(habit__user=user).order_by('-tracking_date').first()

            if last_tracker_entry:
                last_tracking_date = last_tracker_entry.tracking_date
            else:
                last_tracking_date = None # No habit tracking data yet

            if last_tracking_date != today_date: # It's a new day!
                # 2. Calculate and Save Previous Day's Completion Percentage (if there was a previous day)
                if last_tracking_date:
                    previous_day_trackers = HabitTracker.objects.filter(habit__user=user, tracking_date=last_tracking_date)
                    total_habits_previous_day = previous_day_trackers.count()
                    completed_habits_previous_day = previous_day_trackers.filter(is_completed=True).count()
                    if total_habits_previous_day > 0:
                        previous_day_completion_percentage = (completed_habits_previous_day / total_habits_previous_day) * 100
                        for tracker in previous_day_trackers: # Update all trackers for previous day with percentage
                            tracker.completion_percentage = previous_day_completion_percentage
                            tracker.save()

                 # --- Habit Streak Calculation ---
                if previous_day_completion_percentage is not None and previous_day_completion_percentage >= 80:
                    user.habit_streak += 1
                else:
                    user.habit_streak = 0
                user.save()
                # --- End of Habit Streak Calculation ---

                # 3. Create HabitTracker entries for today (using get_or_create to avoid duplicates)
                user_habits = HabitList.objects.filter(user=user)
                for habit in user_habits:
                    habit_tracker_entry, created_tracker = HabitTracker.objects.get_or_create(
                        habit=habit,
                        tracking_date=today_date,
                        defaults={'is_completed': False, 'completion_percentage': 0.00} # Set defaults for new entries
                    )

                    # 4. Create corresponding TaskCard objects for today's habits (if they don't exist) and link them
                    existing_task = TaskCard.objects.filter(
                        user=user,
                        is_habit=True,
                        title=habit.habit_name,
                        due_date=today_date,
                        habit_tracker=habit_tracker_entry # Also check for the linked habit tracker
                    ).first()

                    if not existing_task:
                        task_card = TaskCard.objects.create(
                            user=user,
                            is_habit=True,
                            title=habit.habit_name,
                            summary=habit.habit_description if habit.habit_description else "", # Optional description
                            due_date=today_date,
                            status='to_do', # You can set a default status for habit-tasks
                            habit_tracker=habit_tracker_entry # Link the TaskCard to the HabitTracker entry
                        )
                        print(f"Created task card '{task_card.title}' and linked to HabitTracker entry.")
                    elif existing_task and existing_task.habit_tracker is None:
                        # If task exists but is not linked, link it (this might happen from previous implementations)
                        existing_task.habit_tracker = habit_tracker_entry
                        existing_task.save()
                        print(f"Linked existing task card '{existing_task.title}' to HabitTracker entry.")

            # --- Habit Tracking Logic End ---

            check_and_award_badges(user) # Call the function to check and award badges for the logged-in user

            return Response(
                {'message': 'Login successful!', 'token': token.key},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED
            )


# --- Replace your existing UserProfileView with this ---
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API view to get and update the profile of the logged-in user.
    Requires authentication.
    Supports partial updates (PATCH).
    """
    serializer_class = UserProfileUpdateSerializer # Use the serializer for updates
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    # Add parsers for handling file uploads (like profile image)

    parser_classes = (MultiPartParser, FormParser, JSONParser) # <--- Add JSONParser here

    def get_object(self):
        """
        Returns the currently authenticated user's profile object.
        This ensures a user can only get/update their own profile.
        """
        return self.request.user

    # The RetrieveUpdateAPIView automatically handles:
    # GET requests using get_object() and serializing with serializer_class
    # PUT/PATCH requests using get_object(), validating data with serializer_class.is_valid(),
    # and calling serializer.save() which triggers the serializer's update() method.

# --- End of replacement code for UserProfileView ---


class TaskCardViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for CRUD operations on TaskCard model.
    Requires authentication.
    """
    queryset = TaskCard.objects.all() # Get all tasks initially, filter in get_queryset
    serializer_class = TaskCardSerializer # Use the TaskCardSerializer we just created/moved
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Override get_queryset to filter tasks for the current user only.
        """
        return TaskCard.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Override perform_create to automatically set the user when creating a task.
        """
        serializer.save(user=self.request.user)

    def update(self, request, pk=None):
        """
        Override the update method to handle status changes for habit tasks and sync with HabitTracker.
        """
        try:
            task_card = TaskCard.objects.get(pk=pk, user=request.user)
        except TaskCard.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(task_card, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # --- Habit Tracker Sync (Task to Habit) ---
            if task_card.is_habit and task_card.habit_tracker: # Check if it's a habit task and linked
                habit_tracker = task_card.habit_tracker
                if serializer.validated_data.get('status') == 'done':
                    habit_tracker.is_completed = True
                    habit_tracker.save()
                    print(f"Habit task card '{task_card.title}' marked as done. Habit '{habit_tracker.habit.habit_name}' marked as completed.")
                elif serializer.validated_data.get('status') == 'to_do':
                    habit_tracker.is_completed = False
                    habit_tracker.save()
                    print(f"Habit task card '{task_card.title}' marked as to_do. Habit '{habit_tracker.habit.habit_name}' marked as not completed.")

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
        

class HabitListViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for CRUD operations on HabitList model.
    Requires authentication.
    """
    queryset = HabitList.objects.all() # Get all habits initially, filter in get_queryset
    serializer_class = HabitListSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Override get_queryset to filter habits for the current user only.
        """
        return HabitList.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Override perform_create to automatically set the user when creating a habit.
        """
        serializer.save(user=self.request.user)


# --- HabitTracker ViewSet ---
class HabitTrackerViewSet(viewsets.ModelViewSet): # Keep using ModelViewSet for update action
    """
    API ViewSet for retrieving and updating HabitTracker entries.
    Requires authentication.
    """
    serializer_class = HabitTrackerSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Override get_queryset to filter HabitTracker entries for the current user and today's date.
        """
        today_date = datetime.date.today()
        return HabitTracker.objects.filter(habit__user=self.request.user, tracking_date=today_date)


    def list(self, request, *args, **kwargs):
        """
        Override list action to return Habits for Today.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    def update(self, request, pk=None): # Add the 'update' action to handle PUT requests
        """
        Update the is_completed status of a HabitTracker entry and sync with TaskCard.
        """
        try:
            tracker_entry = HabitTracker.objects.get(pk=pk, habit__user=request.user) # Get tracker entry, verify user ownership
        except HabitTracker.DoesNotExist:
            return Response({'error': 'HabitTracker entry not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(tracker_entry, data=request.data, partial=True) # Use partial=True to allow partial updates
        if serializer.is_valid():
            serializer.save() # Save the updated is_completed status

            # --- TaskCard Sync (Habit to Task) ---
            task_card = tracker_entry.task_card.first() # Access the linked TaskCard

            if task_card:
                if serializer.validated_data.get('is_completed') is True:
                    task_card.status = 'done'
                    task_card.save()
                    print(f"Habit '{tracker_entry.habit.habit_name}' completed. Task card '{task_card.title}' marked as done.")
                elif serializer.validated_data.get('is_completed') is False:
                    task_card.status = 'to_do'
                    task_card.save()
                    print(f"Habit '{tracker_entry.habit.habit_name}' marked as not completed. Task card '{task_card.title}' set to to_do.")

            return Response(serializer.data, status=status.HTTP_200_OK) # Return updated tracker entry
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) # Return serializer validation errors
        



class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated] # Ensure only authenticated users can access events

    def get_queryset(self):
        """
        This view should return a list of all events for the currently authenticated user.
        """
        return Event.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class TodayJournalEntryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JournalEntrySerializer

    def get(self, request):
        today_date = timezone.now().date()
        try:
            journal_entry = JournalEntry.objects.get(user_id=request.user, date_created__date=today_date)
            serializer = self.get_serializer(journal_entry)
            return Response(serializer.data)
        except JournalEntry.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, data={'detail': 'No journal entry found for today.'})

    def post(self, request):
        today_date = timezone.now().date()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                # Check if an entry exists for today
                journal_entry = JournalEntry.objects.get(user_id=request.user, date_created__date=today_date)
                # Update existing entry
                serializer.update(journal_entry, serializer.validated_data) # Use serializer.update to update
                return Response(self.get_serializer(journal_entry).data, status=status.HTTP_200_OK) # Return updated entry
            except JournalEntry.DoesNotExist:
                # Create a new entry
                serializer.save(user_id=request.user) # Pass user to serializer's save method
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


# NEW VIEW FOR LISTING ALL JOURNAL ENTRIES
class JournalEntryListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JournalEntrySerializer

    def get_queryset(self):
        """
        This view should return a list of all journal entries for the currently authenticated user.
        """
        return JournalEntry.objects.filter(user_id=self.request.user).order_by('-date_created') # Order by date, newest first
    


# NEW VIEW TO LIST ALL BADGES
class BadgeListView(generics.ListAPIView):
    """
    API view to list all available badges.
    """
    queryset = Badge.objects.all() # Fetch all Badge objects
    serializer_class = BadgeSerializer


class UserBadgeListView(generics.ListAPIView):
    """
    API endpoint to retrieve the list of badges earned by the logged-in user.
    """
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users can access

    def get_queryset(self):
        """
        Override get_queryset to return UserBadges for the current user.
        """
        user = self.request.user
        return UserBadge.objects.filter(user=user).select_related('badge') # Optimize query and prefetch related Badge data
    



class HabitCompletionWeeklyView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        start_of_week = today - datetime.timedelta(days=today.weekday())
        end_of_week = start_of_week + datetime.timedelta(days=6)
        weekly_data = []
        for i in range(7):
            current_date = start_of_week + datetime.timedelta(days=i)
            completed_habits_count = HabitTracker.objects.filter(
                habit__user=user,
                tracking_date=current_date,
                is_completed=True
            ).count()
            weekly_data.append({
                'day': current_date.strftime('%a'),  # Abbreviated day name
                'completedHabits': completed_habits_count,
            })
        return Response(weekly_data)

class HabitStreakView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()

        # Fetch past habit tracker entries (excluding today), most recent first
        trackers = HabitTracker.objects.filter(
            habit__user=user,
            tracking_date__lt=today
        ).order_by('-tracking_date')

        streak = 0
        expected_date = today - timedelta(days=1)

        seen_dates = set()

        for tracker in trackers:
            track_date = tracker.tracking_date
            if track_date in seen_dates:
                continue  # Skip duplicates (multiple habits per day)
            seen_dates.add(track_date)

            # If there's a gap between expected and this track_date, break the streak
            if track_date != expected_date:
                break

            # Get all trackers for that date and calculate completion
            day_trackers = HabitTracker.objects.filter(habit__user=user, tracking_date=track_date)
            total = day_trackers.count()
            completed = day_trackers.filter(is_completed=True).count()
            percentage = (completed / total) * 100 if total else 0

            if percentage >= 80:
                streak += 1
                expected_date -= timedelta(days=1)
            else:
                break  # streak broken due to low completion

        return Response({'habitStreak': streak})
    

class TaskStatusCountsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        status_counts = TaskCard.objects.filter(user=user).values('status').annotate(count=Count('id'))
        formatted_data = [{'name': item['status'], 'value': item['count']} for item in status_counts]
        return Response(formatted_data)
    
class TaskPriorityCountsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        priority_counts = TaskCard.objects.filter(user=user).values('priority').annotate(count=Count('id'))
        formatted_data = [{'name': item['priority'], 'value': item['count']} for item in priority_counts]
        return Response(formatted_data)
    
class TaskTypeCountsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        task_type_counts = TaskCard.objects.filter(user=user).values('task_type').annotate(count=Count('id'))
        formatted_data = [{'name': item['task_type'], 'value': item['count']} for item in task_type_counts]
        return Response(formatted_data)
    
class TaskCompletionRateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # Calculate the start and end of the current week (Monday to Sunday)
        start_of_week = today - datetime.timedelta(days=today.weekday())
        end_of_week = start_of_week + datetime.timedelta(days=6)

        # Generate a list of all dates in the current week
        all_dates = []
        current_date = start_of_week
        while current_date <= end_of_week:
            all_dates.append(current_date)
            current_date += datetime.timedelta(days=1)

        # Query task completion status for each day of the current week
        weekly_completion_data = []
        for date in all_dates:
            done_count = TaskCard.objects.filter(
                user=user,
                due_date=date,
                status='done'
            ).count()
            todo_count = TaskCard.objects.filter(
                user=user,
                due_date=date,
                status__in=['to_do'] # Adjust status values as needed
            ).count()
            weekly_completion_data.append({
                'dueDate': date.isoformat(),
                'Done': done_count,
                'ToDo': todo_count,
            })

        return Response(weekly_completion_data)
    

class UpcomingEventsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now() # Get the current date and time (with timezone)

        # To get the end of the current month (exclusive), we go to the start of the next month.
        if now.month == 12:
            next_month_start = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            next_month_start = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)

        upcoming_events = Event.objects.filter(
            user=user,
            start_time__gte=now,          # Filter for events starting from the current date and time onwards
            start_time__lt=next_month_start # Filter for events starting before the beginning of the next month
        ).order_by('start_time')

        data = [
            {
                'id': event.id,
                'title': event.subject,
                'location': event.location,
                'start_time': event.start_time.isoformat(), # Send full ISO 8601 string
                'end_time': event.end_time.isoformat(),     # Send full ISO 8601 string
                'description': event.description,
                'category_color': event.category_color,
            }
            for event in upcoming_events
        ]
        return Response(data)