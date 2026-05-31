export const maxDuration = 15;

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return Response.json({ photo: null, reason: 'no_api_key' });
  }

  try {
    const { query } = await req.json();
    const q = String(query || '').trim().slice(0, 300);
    if (!q) return Response.json({ photo: null, reason: 'empty_query' });

    // 1. Text Search pour trouver le lieu
    const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
    const searchRes = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos',
      },
      body: JSON.stringify({
        textQuery: q,
        maxResultCount: 1,
      }),
    });

    if (!searchRes.ok) {
      console.error('Google Places search error:', await searchRes.text());
      return Response.json({ photo: null, reason: 'search_failed' });
    }

    const searchData = await searchRes.json();
    const place = searchData.places?.[0];
    if (!place?.photos?.length) {
      return Response.json({ photo: null, reason: 'no_photos' });
    }

    // 2. Récupérer l'URL de la photo (la première, généralement la meilleure)
    const photoRef = place.photos[0].name;
    const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=1024&key=${apiKey}`;

    // 3. Suivre la redirection pour obtenir l'URL finale de l'image
    const photoRes = await fetch(photoUrl, { redirect: 'follow' });
    if (!photoRes.ok) {
      return Response.json({ photo: null, reason: 'photo_fetch_failed' });
    }

    // L'URL finale après redirection
    const finalUrl = photoRes.url;

    return Response.json({
      photo: finalUrl,
      placeName: place.displayName?.text || q,
    });
  } catch (err) {
    console.error('Erreur recherche photo lieu:', err);
    return Response.json({ photo: null, reason: 'error' });
  }
}
