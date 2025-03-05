# kanbanapi/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TaskCard, HabitList, HabitTracker, Event

User = get_user_model() # Get the User model

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[])
    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'name', 'bio', 'country', 'profile_image')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'name': {'required': True},
            'country': {'required': True},
            'bio': {'required': True},
        }

    def create(self, validated_data):
        """
        Override create method to handle user creation with profile image.
        """
        username = validated_data['username']
        password = validated_data['password']
        email = validated_data['email']
        name = validated_data['name']
        bio = validated_data['bio']
        country = validated_data['country']
        profile_image = validated_data.get('profile_image')

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            name=name,
            bio=bio,
            country=country,
        )
        if profile_image:
            user.profile_image = profile_image
            user.save()
        return user


class TaskCardSerializer(serializers.ModelSerializer):
    """
    Serializer for the TaskCard model.
    """
    user_username = serializers.SerializerMethodField(read_only=True) # Added user_username field

    class Meta:
        model = TaskCard
        fields = [
            'id', 'title', 'summary', 'status', 'task_type', 'priority', 'due_date', 'user', 'user_username' # Added user_username to fields
        ]
        read_only_fields = ['user', 'user_username'] # user and user_username are read-only in API output

    def get_user_username(self, obj):
        """
        Method to get the username of the related user for API output.
        """
        if obj.user:
            return obj.user.username
        return None # Or handle case where user might be null
    

class HabitListSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitList
        fields = ['id', 'habit_name', 'habit_description', 'created_at', 'updated_at'] # Include 'id' to get habit_id in response
        read_only_fields = ['id', 'created_at', 'updated_at'] # Make these fields read-only


# --- HabitTracker Serializer ---
class HabitTrackerSerializer(serializers.ModelSerializer):
    habit_name = serializers.CharField(source='habit.habit_name', read_only=True)
    habit_description = serializers.CharField(source='habit.habit_description', read_only=True)

    class Meta:
        model = HabitTracker
        fields = ['id', 'habit', 'habit_name', 'habit_description', 'tracking_date', 'is_completed', 'completion_percentage']
        read_only_fields = ['id', 'habit', 'tracking_date', 'completion_percentage', 'habit_name', 'habit_description'] # Keep read-only fields
        # Remove 'is_completed' from read_only_fields to make it writable for updates


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'subject', 'location', 'start_time', 'end_time', 'category_color', 'description'] # Include 'id'