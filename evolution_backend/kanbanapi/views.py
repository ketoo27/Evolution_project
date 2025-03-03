# kanbanapi/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets # Removed serializers import, added viewsets
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
from django.db import IntegrityError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from .serializers import UserRegistrationSerializer, TaskCardSerializer, HabitListSerializer, HabitTrackerSerializer # <---- Import serializers from serializers.py
from .models import TaskCard, HabitList, HabitTracker
import datetime


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
            last_tracker_entry = HabitTracker.objects.filter(habit__user=user).order_by('-tracking_date').first()

            if last_tracker_entry:
                last_tracking_date = last_tracker_entry.tracking_date
            else:
                last_tracking_date = None # No habit tracking data yet

            if last_tracking_date != today_date: # It's a new day!
                # 1. Calculate and Save Previous Day's Completion Percentage (if there was a previous day)
                if last_tracking_date:
                    previous_day_trackers = HabitTracker.objects.filter(habit__user=user, tracking_date=last_tracking_date)
                    total_habits_previous_day = previous_day_trackers.count()
                    completed_habits_previous_day = previous_day_trackers.filter(is_completed=True).count()
                    if total_habits_previous_day > 0:
                        previous_day_completion_percentage = (completed_habits_previous_day / total_habits_previous_day) * 100
                        for tracker in previous_day_trackers: # Update all trackers for previous day with percentage
                            tracker.completion_percentage = previous_day_completion_percentage
                            tracker.save()

                # 2. Create HabitTracker entries for today (using get_or_create to avoid duplicates)
                user_habits = HabitList.objects.filter(user=user)
                for habit in user_habits:
                    HabitTracker.objects.get_or_create(
                        habit=habit,
                        tracking_date=today_date,
                        defaults={'is_completed': False, 'completion_percentage': 0.00} # Set defaults for new entries
                    )

            # --- Habit Tracking Logic End ---

            return Response(
                {'message': 'Login successful!', 'token': token.key},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserProfileView(APIView):
    """
    API view to get the profile of the logged-in user.
    Requires authentication (TokenAuthentication).
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Handles GET requests to return user profile data.
        """
        user = request.user

        profile_image_url = None
        if user.profile_image:
            profile_image_url = request.build_absolute_uri(user.profile_image.url)

        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name,
            'bio': user.bio,
            'country': user.country,
            'profile_image': profile_image_url,
        }
        return Response(user_data, status=status.HTTP_200_OK)


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
        Update the is_completed status of a HabitTracker entry.
        """
        try:
            tracker_entry = HabitTracker.objects.get(pk=pk, habit__user=request.user) # Get tracker entry, verify user ownership
        except HabitTracker.DoesNotExist:
            return Response({'error': 'HabitTracker entry not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(tracker_entry, data=request.data, partial=True) # Use partial=True to allow partial updates
        if serializer.is_valid():
            serializer.save() # Save the updated is_completed status
            return Response(serializer.data, status=status.HTTP_200_OK) # Return updated tracker entry
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) # Return serializer validation errors