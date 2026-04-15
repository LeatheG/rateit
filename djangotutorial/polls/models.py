import datetime

from django.db import models
from django.utils import timezone
from django.contrib import admin


class Game(models.Model):
    game_name = models.CharField(max_length=200)
    release_date = models.DateTimeField("release date")
    genre = models.CharField(max_length=100, default="Action")
    game_image = models.URLField(max_length=500, blank=True, help_text="URL to game cover image")
    youtube_video = models.URLField(max_length=500, blank=True, help_text="YouTube video URL")
    video_description = models.TextField(blank=True, help_text="Short description of the video")
    
    def __str__(self):
        return self.game_name
    
    def get_youtube_embed_url(self):
        """Convert YouTube URL to embed URL"""
        if 'youtube.com/watch?v=' in self.youtube_video:
            video_id = self.youtube_video.split('watch?v=')[1].split('&')[0]
            return f"https://www.youtube.com/embed/{video_id}"
        elif 'youtu.be/' in self.youtube_video:
            video_id = self.youtube_video.split('youtu.be/')[1].split('?')[0]
            return f"https://www.youtube.com/embed/{video_id}"
        return self.youtube_video
    
    @admin.display(
        boolean=True,
        ordering="release_date",
        description="Released recently?",
    )
    def was_released_recently(self):
        now = timezone.now()
        return now - datetime.timedelta(days=30) <= self.release_date <= now


class Rating(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    rating_text = models.TextField() 
    likes = models.IntegerField(default=0)
    dislikes = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.rating_text[:50]}... - {self.game.game_name}"
    
    