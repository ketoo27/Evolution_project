from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class CustomUser(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Adds fields for name, country, and bio.
    """
    name = models.CharField(max_length=150, blank=True, verbose_name='Name') # Full name
    country = models.CharField(max_length=100, blank=True, verbose_name='Country')
    bio = models.TextField(blank=True, verbose_name='Bio')
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True) # <---- MUST BE ImageField

    def __str__(self):
        return self.username # Or self.email, or self.name, depending on what you want to identify users by
    
class TaskCard(models.Model):
    """
    Model representing a task card in a personal development Kanban board.
    """

    STATUS_CHOICES = [
        ('to_do', 'To Do'),
        ('processing', 'Processing'),
        ('done', 'Done'),
    ]

    TASK_TYPE_CHOICES = [
        ('personal', 'Personal'),
        ('professional', 'Professional'),
        ('educational', 'Educational/Learning'),
        ('health_wellness', 'Health & Wellness'),
        ('financial', 'Financial'),
        ('other', 'Other'), # Keep 'Other' as a catch-all
        ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    title = models.CharField(max_length=200, verbose_name="Task Title", help_text="Briefly describe the task.")
    summary = models.TextField(blank=True, null=True, verbose_name="Summary", help_text="Detailed description or notes for the task (optional).")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='to_do', verbose_name="Status", help_text="Current status of the task.")
    task_type = models.CharField(max_length=50, choices=TASK_TYPE_CHOICES, default='other', verbose_name="Type", help_text="Category of the task.")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name="Priority", help_text="Priority level of the task.")
    due_date = models.DateField(blank=True, null=True, verbose_name="Due Date", help_text="Optional date by which the task should be completed.")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')


    # New fields to connect with Habit and Event
    is_habit = models.BooleanField(default=False, verbose_name="Is Habit", help_text="Indicates if this task is a daily habit.")
    is_event = models.BooleanField(default=False, verbose_name="Is Related to Event", help_text="Indicates if this task is related to a scheduled event.")
    related_event = models.ForeignKey('Event', on_delete=models.SET_NULL, null=True, blank=True, related_name='related_tasks', verbose_name="Related Event", help_text="The event this task is related to (optional).")

    def __str__(self):
        return self.title



class HabitList(models.Model):
    """
    Model to store the list of habits for each user.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) # Link to Django User model
    habit_name = models.CharField(max_length=255, null=False, blank=False)
    habit_description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.habit_name
    

class HabitTracker(models.Model):
    """
    Model to store daily habit tracking data.
    """
    habit = models.ForeignKey(HabitList, on_delete=models.CASCADE) # Link to HabitList model
    tracking_date = models.DateField(null=False, blank=False)
    is_completed = models.BooleanField(default=False, null=False, blank=False)
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00) # Store daily completion %
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('habit', 'tracking_date') # Ensure unique entries per habit per day

    def __str__(self):
        return f"{self.habit.habit_name} - {self.tracking_date}"
    


class Event(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    description = models.TextField(blank=True, null=True)
    category_color = models.CharField(max_length=200, blank=True, null=True) # You can use this for color-coding events

    def __str__(self):
        return self.subject
    

class JournalEntry(models.Model):
    journal_entry_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)  # Or adjust max_length as needed
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True) # Automatically set on creation
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        # Ensure only one journal entry per user per day
        unique_together = ('user_id', 'date_created') # Corrected unique_together

        def __str__(self):
            return f"{self.title} - {self.date_created.strftime('%Y-%m-%d')}"
        


class Badge(models.Model):
    """
    Model representing badges that users can earn.
    """
    BADGE_TYPE_CHOICES = [
        ('task', 'Task'),
        ('habit', 'Habit'),
        ('schedule', 'Schedule'),
        ('journal', 'Journal'),
        ('general', 'General'), # For badges that don't fit into the other categories
    ]

    title = models.CharField(max_length=100, unique=True, verbose_name='Badge Title')
    description = models.TextField(verbose_name='Badge Description')
    criteria = models.TextField(verbose_name='Badge Criteria', help_text='Detailed criteria for earning this badge (for admin reference).')
    badge_type = models.CharField(max_length=20, choices=BADGE_TYPE_CHOICES, default='general', verbose_name='Badge Type')
    icon = models.CharField(max_length=255, verbose_name='Badge Icon File Path', help_text='File path to the badge icon image (e.g., "badges/organized.png").')  # Store icon file path

    def __str__(self):
        return self.title
    

class UserBadge(models.Model):
    """
    Model representing badges earned by users.
    This acts as a through model for the many-to-many relationship between CustomUser and Badge.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_badges') # Link to CustomUser
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='user_badges') # Link to Badge
    earned_date = models.DateTimeField(auto_now_add=True, verbose_name='Date Earned') # Timestamp when badge was earned

    class Meta:
        unique_together = ('user', 'badge') # Ensure a user can earn each badge only once

    def __str__(self):
        return f"{self.user.username} - {self.badge.title}"