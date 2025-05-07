# kanbanapi/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TaskCard, HabitList, HabitTracker, Event, JournalEntry, Badge, UserBadge
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


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
            'id', 'title', 'summary', 'status', 'task_type', 'priority', 'due_date',
            'user', 'user_username', 'is_habit', 'is_event', 'related_event' # Added new fields
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


class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['journal_entry_id', 'title', 'content', 'date_created'] # Include date_created for retrieval
        read_only_fields = ['journal_entry_id', 'date_created'] # These fields should not be updated directly during create/update


class BadgeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Badge model.
    """
    class Meta:
        model = Badge
        fields = ['id', 'title', 'description', 'criteria', 'badge_type', 'icon'] # Include all fields from the Badge model



# NEW SERIALIZER FOR UserBadge MODEL
class UserBadgeSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserBadge model.
    """
    badge = BadgeSerializer(read_only=True) # Serialize related Badge object

    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'earned_date'] # Fields for UserBadge


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating the CustomUser profile.
    Includes password verification for sensitive updates.
    """
    # Keep current_password as write-only, but now it's effectively required for any update
    current_password = serializers.CharField(write_only=True, required=True, help_text="Your current password, required for any profile update.") # <--- Set required=True
    password = serializers.CharField(write_only=True, required=False, help_text="Leave blank if you don't want to change the password.")

    class Meta:
        model = User
        # username included for retrieval, read-only
        fields = ('username', 'name', 'email', 'country', 'bio', 'profile_image', 'password', 'current_password')
        read_only_fields = ('username', 'last_login', 'date_joined')


    def validate_email(self, value):
        # Custom validation to ensure email is unique (excluding the current user)
        # Only validate if the email value is actually being provided (optional fields might be missing)
        if value is not None: # Check if email is part of the submitted data
            user = self.instance
            # If the email is being changed AND the new email already exists for another user
            if value != user.email and User.objects.exclude(pk=user.pk).filter(email=value).exists():
                 raise serializers.ValidationError("This email is already in use by another user.")
        return value # Return the validated value (could be None if not provided in partial update)


    def validate_current_password(self, value):
         # This validation runs automatically because required=True is set on the field
         # We still need the check in update to use instance.check_password
         return value


    def validate_password(self, value):
        # Validate the new password against Django's password validators
        if value: # Only validate if a new password is provided
            try:
                validate_password(value, user=self.instance)
            except DjangoValidationError as e:
                 raise serializers.ValidationError(list(e.messages))
        return value

    def update(self, instance, validated_data):
        print("--- Entering serializer update method ---")
        print("Initial instance data (before update):", instance.__dict__)
        print("Validated Data received:", validated_data) # Print all validated data received

        # --- Password Verification (Now mandatory for any update) ---
        # Because current_password is required=True, it will always be in validated_data
        current_password = validated_data.pop('current_password')
        print("Popped 'current_password' from validated_data.")

        # Verify the provided current_password against the user's actual password
        if not instance.check_password(current_password):
            print("Error: Incorrect current password provided.")
            raise serializers.ValidationError({"current_password": "Incorrect password."})

        print("Current password verified successfully.")

        # --- Update Password (if provided) ---
        new_password = validated_data.pop('password', None)
        if new_password:
             print("New password provided. Hashing and setting.")
             instance.set_password(new_password)
             # set_password hashes the password, it doesn't save to the DB yet


        # --- Update Other Fields ---
        print("Attempting to update other fields from validated_data...")
        fields_updated_count = 0
        for attr, value in validated_data.items():
             print(f"Processing field: '{attr}' with value: '{value}' (Type: {type(value)})")
             if attr == 'profile_image':
                 # Handle image removal signal (None or empty string from FormData)
                 if value is None or (isinstance(value, str) and value == ''):
                     print("Profile image removal signaled.")
                     if instance.profile_image:
                          print("Deleting old profile image file.")
                          instance.profile_image.delete() # Delete the old image file
                     setattr(instance, attr, None)
                     print(f"Set '{attr}' to None.")
                     fields_updated_count += 1
                 else: # Handles a new file upload (value should be a File-like object)
                      print("New profile image provided.")
                      # DRF's serializer save handles deleting the old file on new file assignment
                      setattr(instance, attr, value)
                      print(f"Set '{attr}' to new image file object.")
                      fields_updated_count += 1
             else:
                 # Update other fields like name, email, country, bio
                 # Check if the value is actually different before setting (optional check for debugging)
                 # current_value = getattr(instance, attr)
                 # if current_value != value:
                 #      print(f"Value for '{attr}' changed from '{current_value}' to '{value}'. Setting.")
                 #      setattr(instance, attr, value)
                 #      fields_updated_count += 1
                 # else:
                 #      print(f"Value for '{attr}' is unchanged ('{value}'). Skipping setattr.")

                 # For simplicity and standard serializer behavior, just set it regardless if it's in validated_data
                 setattr(instance, attr, value) # <--- This is where the actual update happens on the instance object
                 print(f"Set '{attr}' to '{value}'.")
                 fields_updated_count += 1


        print(f"Finished processing validated_data items. {fields_updated_count} fields were attempted to be updated.")

        print("Calling instance.save()...")
        try:
            instance.save() # <--- Save the changes to the database
            print("instance.save() successful.")
        except Exception as e:
            print(f"Error during instance.save(): {e}")
            # IMPORTANT: Re-raise the exception so DRF catches it and returns a 500 or other appropriate status
            # If we just print and don't re-raise, the request completes as 200 OK even if save fails.
            raise e

        print("--- Exiting serializer update method. Returning updated instance. ---")
        return instance # Return the updated instance