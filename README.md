# Notes:
I ran into some issues with the API:
 - The API didn't correctly filter via release_date.gte/lte so I used primary_release_date instead.
 - The API had some problems with too many requests, so I added artificial throttling to overcome the issue (see https://developers.themoviedb.org/3/getting-started/request-rate-limiting).
 - I also had problems with the API going in and out, so I added caching to a MySQL database to be less reliant on the service being up.
 - I noticed inconsistent results from the API (called the /discover/movie API and got different number of total pages for the same parameters).  This may affect the returned number of matches.
 - There were different search criteria for both the movies and the tv shows (release_date.lte/gte vs primary_release_date.lte/gte and air_date.lte/gte vs first_air_date.lte/gte).  I used the more specific ones (primary_release_date.* and first_air_date.*) to calculate the results, but this is easy to change in the code.

I set this up to get all the answers on node startup and then have the result available for requests.  In a production scenario, this would have a longer startup time, which is less desireable.  One would typically run the processing in the background, and/or have a more optimized database call.
In the interest of time, I added all database specific processing to the models/inputs.  In a larger project, this should be separated out.

Other than caching, I am storing only the movie/tv show ids to get to the credits.  If in the future we need more information, we can always change the array to a map and add the extra information in memory.  I did store the full credits in a map to illustrate this.  If this is not needed, an array or set would work just as well there with less memory usage.

I ran this with the names instead of the actor ids and had an extra match (there are two Chen Yu's with different ids in the dataset).

