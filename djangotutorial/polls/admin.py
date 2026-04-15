from django.contrib import admin

from .models import Rating, Game


class RatingInline(admin.TabularInline):
    model = Rating
    extra = 5


class GameAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {"fields": ["game_name", "genre", "game_image"]}),
        ("Release information", {"fields": ["release_date"], "classes": ["collapse"]}),
        ("Video Recommendation", {"fields": ["youtube_video", "video_description"], "classes": ["collapse"]}),
    ]
    inlines = [RatingInline]
    list_display = ["game_name", "genre", "release_date", "was_released_recently"]
    list_filter = ["release_date", "genre"]
    search_fields = ["game_name"]


admin.site.register(Game, GameAdmin)