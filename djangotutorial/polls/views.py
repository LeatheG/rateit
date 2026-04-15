from django.db.models import F
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.views import generic

from .models import Rating, Game


class IndexView(generic.ListView):
    template_name = "polls/index.html"
    context_object_name = "latest_game_list"

    def get_queryset(self):
        """Return all games ordered by release date."""
        return Game.objects.order_by("-release_date")


class DetailView(generic.DetailView):
    model = Game
    template_name = "polls/detail.html"


class ResultsView(generic.DetailView):
    model = Game
    template_name = "polls/results.html"


def like_rating(request, rating_id):
    rating = get_object_or_404(Rating, pk=rating_id)
    rating.likes = F("likes") + 1
    rating.save()
    rating.refresh_from_db()
    return JsonResponse({'success': True, 'count': rating.likes})


def dislike_rating(request, rating_id):
    rating = get_object_or_404(Rating, pk=rating_id)
    rating.dislikes = F("dislikes") + 1
    rating.save()
    rating.refresh_from_db()
    return JsonResponse({'success': True, 'count': rating.dislikes})
