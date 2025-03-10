# kanbanapi/admin.py
from django.contrib import admin
from .models import Badge, TaskCard, HabitList, HabitTracker, Event, JournalEntry, UserBadge # Import your models, including Badge

# Register your models here.
admin.site.register(Badge)
admin.site.register(TaskCard)
admin.site.register(HabitList)
admin.site.register(HabitTracker)
admin.site.register(Event)
admin.site.register(JournalEntry)
admin.site.register(UserBadge)