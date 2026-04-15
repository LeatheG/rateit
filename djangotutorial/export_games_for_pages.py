import json
import os
from pathlib import Path

import django


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
django.setup()

from polls.models import Game  # noqa: E402


def serialize_games():
    games = []
    for game in Game.objects.order_by("-release_date"):
        games.append(
            {
                "id": game.id,
                "game_name": game.game_name,
                "release_date": game.release_date.isoformat() if game.release_date else None,
                "genre": game.genre,
                "game_image": game.game_image or "",
                "youtube_video": game.youtube_video or "",
                "video_description": game.video_description or "",
                "ratings": [
                    {
                        "id": rating.id,
                        "rating_text": rating.rating_text,
                        "likes": rating.likes,
                        "dislikes": rating.dislikes,
                    }
                    for rating in game.rating_set.all()
                ],
            }
        )

    return {"games": games}


def main():
    data = serialize_games()
    output_path = Path(__file__).resolve().parent.parent / "docs" / "data" / "games.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Exported {len(data['games'])} games to {output_path}")


if __name__ == "__main__":
    main()
