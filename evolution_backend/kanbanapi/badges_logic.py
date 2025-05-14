# kanbanapi/badges_logic.py
from datetime import timedelta
from django.utils import timezone
from .models import Badge, UserBadge, TaskCard, HabitTracker, HabitList, Event, JournalEntry  # Import all necessary models


def check_organized_badge(user):
    """
    Checks if a user has earned the "Organized" badge (completed 10 tasks) and awards it if they have not already earned it.
    """
    organized_badge = Badge.objects.get(title="Organized")
    if UserBadge.objects.filter(user=user, badge=organized_badge).exists():
        return

    completed_task_count = TaskCard.objects.filter(user=user, status='done').count()
    if completed_task_count >= 10:
        UserBadge.objects.create(user=user, badge=organized_badge)
        print(f"Awarded 'Organized' badge to user: {user.username}")


def check_productive_badge(user):
    """
    Checks if a user has earned the "Productive" badge (completed 20 tasks) and awards it if they have not already earned it.
    """
    productive_badge = Badge.objects.get(title="Productive")
    if UserBadge.objects.filter(user=user, badge=productive_badge).exists():
        return

    completed_task_count = TaskCard.objects.filter(user=user, status='done').count()
    if completed_task_count >= 20:
        UserBadge.objects.create(user=user, badge=productive_badge)
        print(f"Awarded 'Productive' badge to user: {user.username}")


def check_streak_starter_badge(user):
    """
    Checks if a user has earned the "Streak Starter" badge based on their habit_streak field
    and awards it if not already earned.
    Criteria: habit_streak is 3 or more.
    """
    print(f"Checking 'Streak Starter' badge for user: {user.username}")

    try:
        # Attempt to get the 'Streak Starter' badge object from the database.
        # This assumes you have a Badge object with the title "Streak Starter".
        streak_starter_badge = Badge.objects.get(title="Streak Starter")
        print(f"Found badge: {streak_starter_badge.title}")
    except Badge.DoesNotExist:
        # If the badge doesn't exist in the database, print an error and stop.
        print("Error: 'Streak Starter' badge not found in the database. Please create it.")
        return # Cannot award badge if it doesn't exist

    # Check if the user already has this specific badge.
    # We query the UserBadge model to see if an entry exists linking this user and this badge.
    if UserBadge.objects.filter(user=user, badge=streak_starter_badge).exists():
        print(f"User {user.username} already has the 'Streak Starter' badge. Skipping check.")
        # If they already have it, there's nothing more to do, so we exit the function.
        return

    # Now, we check the user's 'habit_streak' field directly.
    # This field is assumed to be updated elsewhere based on their daily habit completion.
    print(f"User's current habit_streak: {user.habit_streak}")

    # The criteria for the "Streak Starter" badge is a habit streak of 3 or more.
    if user.habit_streak >= 3:
        print(f"User {user.username} meets the criteria (streak is {user.habit_streak}, needs >= 3).")
        # If the user's streak meets the criteria and they don't already have the badge, award it.
        try:
            # Create a new entry in the UserBadge table to link the user and the badge.
            UserBadge.objects.create(user=user, badge=streak_starter_badge)
            print(f"Successfully awarded 'Streak Starter' badge to user: {user.username}")
        except Exception as e:
            # Catch any potential errors during the badge creation process.
            print(f"Error awarding 'Streak Starter' badge to {user.username}: {e}")
    else:
        # If the user's streak is less than 3, they don't meet the criteria yet.
        print(f"User {user.username} does not meet the criteria (streak is {user.habit_streak}, needs >= 3).")


def check_streak_beginner_badge(user):
    """
    Checks if a user has earned the "Streak Beginner" badge based on their habit_streak field
    and awards it if not already earned.
    Criteria: habit_streak is 7 or more.
    """
    print(f"Checking 'Streak Beginner' badge for user: {user.username}")

    try:
        # Attempt to get the 'Streak Beginner' badge object from the database.
        # This assumes you have a Badge object with the title "Streak Beginner".
        streak_beginner_badge = Badge.objects.get(title="Streak Beginner")
        print(f"Found badge: {streak_beginner_badge.title}")
    except Badge.DoesNotExist:
        # If the badge doesn't exist in the database, print an error and stop.
        print("Error: 'Streak Beginner' badge not found in the database. Please create it.")
        return # Cannot award badge if it doesn't exist

    # Check if the user already has this specific badge.
    # We query the UserBadge model to see if an entry exists linking this user and this badge.
    if UserBadge.objects.filter(user=user, badge=streak_beginner_badge).exists():
        print(f"User {user.username} already has the 'Streak Beginner' badge. Skipping check.")
        # If they already have it, there's nothing more to do, so we exit the function.
        return

    # Now, we check the user's 'habit_streak' field directly.
    # This field is assumed to be updated elsewhere based on their daily habit completion.
    print(f"User's current habit_streak: {user.habit_streak}")

    # The criteria for the "Streak Beginner" badge is a habit streak of 7 or more.
    if user.habit_streak >= 7:
        print(f"User {user.username} meets the criteria (streak >= 7).")
        # Award the badge
        try:
            # Create a new entry in the UserBadge table to link the user and the badge.
            UserBadge.objects.create(user=user, badge=streak_beginner_badge)
            print(f"Successfully awarded 'Streak Beginner' badge to user: {user.username}")
        except Exception as e:
            # Catch any potential errors during the badge creation process.
            print(f"Error awarding 'Streak Beginner' badge to {user.username}: {e}")
    else:
        # If the user's streak is less than 7, they don't meet the criteria yet.
        print(f"User {user.username} does not meet the criteria (streak is {user.habit_streak}, needs >= 7).")

        

def check_scheduler_badge(user):
    """
    Checks if a user has earned the "Scheduler" badge (created 10 events) and awards it if not already earned.
    """
    scheduler_badge = Badge.objects.get(title="Scheduler")
    if UserBadge.objects.filter(user=user, badge=scheduler_badge).exists():
        return

    event_count = Event.objects.filter(user=user).count()
    if event_count >= 10:
        UserBadge.objects.create(user=user, badge=scheduler_badge)
        print(f"Awarded 'Scheduler' badge to user: {user.username}")


def check_planner_badge(user):
    """
    Checks if a user has earned the "Planner" badge (created 20 events) and awards it if not already earned.
    """
    planner_badge = Badge.objects.get(title="Planner")
    if UserBadge.objects.filter(user=user, badge=planner_badge).exists():
        return

    event_count = Event.objects.filter(user=user).count()
    if event_count >= 20:
        UserBadge.objects.create(user=user, badge=planner_badge)
        print(f"Awarded 'Planner' badge to user: {user.username}")


def check_journal_starter_badge(user):
    """
    Checks if a user has earned the "Journal Starter" badge (journal for 7 days) and awards it if not already earned.
    """
    journal_starter_badge = Badge.objects.get(title="Journal Starter")
    if UserBadge.objects.filter(user=user, badge=journal_starter_badge).exists():
        return

    journal_entry_days = JournalEntry.objects.filter(user_id=user).dates('date_created', 'day') # Get unique days with journal entries
    if len(journal_entry_days) >= 7:
        UserBadge.objects.create(user=user, badge=journal_starter_badge)
        print(f"Awarded 'Journal Starter' badge to user: {user.username}")


def check_journal_beginner_badge(user):
    """
    Checks if a user has earned the "Journal Beginner" badge (journal for 7 days in a row) and awards it if not already earned.
    """
    journal_beginner_badge = Badge.objects.get(title="Journal Beginner")
    if UserBadge.objects.filter(user=user, badge=journal_beginner_badge).exists():
        return

    journal_entries = JournalEntry.objects.filter(user_id=user).order_by('-date_created') # Get journal entries ordered by date
    if journal_entries.count() < 7:
        return # Not enough entries to form a 7-day streak

    consecutive_days = 0
    today = timezone.now().date()
    for day_offset in range(7): # Check past 7 days
        check_date = today - timedelta(days=day_offset)
        entry_on_date = JournalEntry.objects.filter(user_id=user, date_created__date=check_date).exists()
        if entry_on_date:
            consecutive_days += 1
        else:
            break # Streak broken

    if consecutive_days == 7:
        UserBadge.objects.create(user=user, badge=journal_beginner_badge)
        print(f"Awarded 'Journal Beginner' badge to user: {user.username}")


# --- Main function to check all badges for a user ---
def check_and_award_badges(user):
    """
    Checks all badge criteria for a user and awards any unearned badges.
    """
    check_organized_badge(user)
    check_productive_badge(user)
    check_streak_starter_badge(user)
    check_streak_beginner_badge(user)
    check_scheduler_badge(user)
    check_planner_badge(user)
    check_journal_starter_badge(user)
    check_journal_beginner_badge(user)