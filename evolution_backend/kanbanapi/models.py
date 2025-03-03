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