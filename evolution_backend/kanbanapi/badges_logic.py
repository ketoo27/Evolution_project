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
    Checks if a user has earned the "Streak Starter" badge (80% habit completion for 3 days) and awards it if not already earned.
    """
    streak_starter_badge = Badge.objects.get(title="Streak Starter")
    if UserBadge.objects.filter(user=user, badge=streak_starter_badge).exists():
        return

    today = timezone.now().date()
    for habit_list in HabitList.objects.filter(user=user): # Iterate through each habit
        consecutive_days = 0
        for day_offset in range(3): # Check past 3 days
            check_date = today - timedelta(days=day_offset)
            try:
                habit_tracker = HabitTracker.objects.get(habit=habit_list, tracking_date=check_date)
                if habit_tracker.completion_percentage >= 80:
                    consecutive_days += 1
                else:
                    break # Streak broken
            except HabitTracker.DoesNotExist:
                break # No tracker entry for that day, streak broken

        if consecutive_days == 3:
            UserBadge.objects.create(user=user, badge=streak_starter_badge)
            print(f"Awarded 'Streak Starter' badge to user: {user.username}")
            return # Award badge only once even if multiple habits qualify


def check_streak_beginner_badge(user):
    """
    Checks if a user has earned the "Streak Beginner" badge (80% habit completion for 7 days) and awards it if not already earned.
    """
    streak_beginner_badge = Badge.objects.get(title="Streak Beginner")
    if UserBadge.objects.filter(user=user, badge=streak_beginner_badge).exists():
        return

    today = timezone.now().date()
    for habit_list in HabitList.objects.filter(user=user): # Iterate through each habit
        consecutive_days = 0
        for day_offset in range(7): # Check past 7 days
            check_date = today - timedelta(days=day_offset)
            try:
                habit_tracker = HabitTracker.objects.get(habit=habit_list, tracking_date=check_date)
                if habit_tracker.completion_percentage >= 80:
                    consecutive_days += 1
                else:
                    break # Streak broken
            except HabitTracker.DoesNotExist:
                break # No tracker entry for that day, streak broken

        if consecutive_days == 7:
            UserBadge.objects.create(user=user, badge=streak_beginner_badge)
            print(f"Awarded 'Streak Beginner' badge to user: {user.username}")
            return # Award badge only once even if multiple habits qualify


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