# @fanfic/parser

Provides parsers for a variety of different fanfic resources.

## SUMMARY

### Currently

You bring the HTTP fetch, we bring the HTML scrabbling. You get a clean
list of normalized fic objects found on the page in question, plus the
url of the next page to fetch.

This pairs with @fanfic/scanner, which handles the fetching and storing in a
database part of the equation.

### For the future

I'll be bringing in author and fic parsing tools from `fetch-fic`, that
can get details about authors and full metadata and content for fics.

### Status

It's still a wee-bit experimental.  These bits I think are pretty stable
now, but they're not quite in production use as yet.  They also could use
some tests.

## CLASSES

### const { Site } = require('@fanfic/parser')

#### construction

* Site.create (href) -> Site

Determine which site to construct an object for based on the URL. 

* Site.create (engine) -> Site

Given a builtin site engine name, construct a new site object.

* Site.create (module-name) -> Site

Given a module name, require the module and return that.

For a list of what sites have built in support, see
[Supported Sites](#Supported_Sites).

#### properties and methods

* name  - _String_

The name of the site.  For most sites this is fixed per site, but some site
parsers (eg the XenForo parser, which supports any site running that forum
software) this may be a domain name instead.

* fetchLink(href) -> String

Given a user visible listing URL, returns the URL that should be fetched to
feed to `parseScan`.  For most sites this is a no-op, but for some like
Wattpad, this changes the HTML listing URL into a JSON listing URL.

* parseScan(scanLink, responseBody) -> Scan

`scanLink` is the URL of a fanfic listing, `responseBody` is the content of
that listing (usually, but not always, HTML).

Returns a `Scan` object fully filled in, with a list of `fics` to iterate
over, and the URL of the `nextPage`.  If there are no further pages then
`nextPage` will be undefined.

* normalizeLink (href[, base]) -> String

Normalizes a link related to this site, possibly resolving it on to `base`
if one is provided. By default this forces `https` and strips trailing `/`s.

* normalizeFicLink (href[, base]) -> String

Normalizes a link to a specific fic. By default this is just `normalizeLink`.

* normalizeAuthorLink (href[, base]) -> String

Normalizes a link to a specific author. By default this is just `normalizeLink`.

* ficLinkFromId (siteId, base) -> String

Generates a link to a fic from the site specific id of that fic.

* newFic ([obj]) -> Fic

Creates an instance of a new fic, possibly of a site specific Fic subclass,
initialized with `obj` if one is provided.  Ordinarily this is called via
`scan.addFic`.

* num (str) -> Number

Converts a string into a number in a site specific manner. By default this
strips commas and then passes it to `Number()`.

### const { Scan } = require('@fanfic/parser')

#### construction

Scan objects are ordinarily constructed and returned by a Site's parseScan
method.

#### properties and methods

* site - _Site_

An instance of the site class that was used to construct these scan results.

* fics - _Array_

The array of fics parsed from this scan.

* nextPage - _String_

The URL of the next page of this scan, parsed during the current scan.

* constructor (site, nextPage)

Initializes the object's properties.  `site` is an object of the `Site`
class.

* addFic ([obj]) -> Fic

Constructs either an empty Fic object or one initialized from `obj` if `obj`
was passed in.  Uses `this.site`'s `newFic` method to construct the fic
object, such that it can be a site-specific subclass.  The resulting Fic
object is pushed on to `this.fics` and then returned.

### const { Fic } = require('@fanfic/parser')

#### construction

```js
const fic = new Fic(site)
```

`site` is an optional site object.  If provided, it's used for URL
normalization.

#### properties and methods

Numeric values will be numified if set to a string.

* site - _Site_

A site object representing which site was used to create this fic object.

If set to a string, then `Site.create` will be called in order to try to
obtain a site object.

Setting the `site` property will ALSO set the `siteName` property from
`site.name` if a site object is available.  If we were unable to create a
site object then siteName will be set to the value site was set to, and site
will be left unset.

* siteName - _String_

The name of the site that this fic came from.

In addition to setting the `siteName` property, will try to set the `site`
property by constructing a new Site object using `Site.create`.

* siteId - _Number_

The site specific id number of this fic.

* link - _String_

A normalized link to this fic.

* published - _Number_

The date the fic was originally published, as seconds since 1970.

* updated - _Number_

The date the fic was most recently updated, as seconds since 1970.

* title - _String_

The title of the fic.

* rating - _String_

The audience the fic is appropriate for.  Values should match one of the AO3
rating strings:

General Audiences, Teen and Up Audiences, Mature, Explicit

* language - _String_

The name of the language that the fic is written in.

* status - _String_

The authoring status of the fic, standard values are:

in-progress, complete, abandoned

* words - _Number_

The number of words in the fic.

* chapterCount - _Number_

The number of chapters in the fic.  For sites with multiple kinds of
chapters, this includes all of them.

* maxChapterCount - _Number_

The total number of chapters that will be in the fic when it is completed.

* cover - _String_

The URL of a cover image for this fic.

* summary - _String_

The summary or description of the fic.


* authors - _Array_

An array of author records.  Author records are objects with name and link
properties. Normally authors are added via the `addAuthor` method.

* tags - _Array_

An array of tags associated with this fic.  All tags should be strings, with
a prefix, followed by a colon, followed by the tag value.  Standard prefixes
include: fandom, ship, friendship, genre and character.  Untyped tags are
prefixed freeform.  Crossovers are indicated with multiple fandom prefixed
tags.

* stats - _Object_

An optional collection of site specific stats.  See the supported sites list
for details on what different sites provide.

## Supported Sites

### Archive of Our Own

* Engine: ao3
* Site Features: Scans
* Scannable Lists: searches, tag lists, author/collection works,
  author/collection bookmarks
* Fic Features: multiple authors, tags, ratings, status, language, words,
  chapterCount, maxChapterCount, summary, stats: comments, kudos, hits,
  bookmarks, collections
* Tag Prefixes: fandom, category, warning, ship, friendship, character, freeform

If a fic has the *Abandoned Work - Unfinished and Discontinued* tag then it
will have a status of `abandoned`.  Users often accidentally mark their fics
as complete by entering a max chapter count equal to their current chapter
count, especially when first adding a fic.

### FanFiction.net

* Engine: ffnet
* Site Features: Scans
* Scannable Lists: searches, C2s, author works, author bookmarks
* Fic Features: published, rating, chapterCount, words, cover, tags,
  language, status, summary, stats: reviews, favs, follows
* Tag Prefixes: fandom, genre, character, ship

maxChapterCount will be set to the same value as chapterCount if status is
complete.  cover images are often, but not always, the image associated
with the author, not with the fic.  Care should be taken before using them. 
Cover image URLs can only be fetched with a `Referer` header that points at
fanfiction.net, so you can't directly link to them.

### Scryer

* Engine: scryer
* Features supported: Scans
* Scannable Lists: Searches
* Fic Features: published, summary, chapterCount, words, rating, tags,
  status, stats: reviews, favs, follows
* Tag Prefixes: fandom, genre, character, ship, scryer

Scryer is an index of a subset of FanFiction.net, so `site.name` is `ffnet`. 
maxChapterCount will be set to the same value as chapterCount if status is
complete.

`scryer` prefixed tags are labels that the site attaches to fic based on a
software analysis of the description and ships and has values like `slash`
and `harem`.

### Wattpad

* Engine: wattpad
* Features supported: Scans
* Scannable Lists: Search
* Fic Features: summary, chapterCount, cover, rating, status, stats:
  comments, kudos, hits
* Tag Prefixes: freeform

maxChapterCount will be set to the same value as chapterCount if status is
complete. Wattpad votes are mapped to kudos, hits to read count.

### XenForo

* Engine: xen
* Features supported: Scans
* Scannable Lists: forums, tags, searches
* Fic Features: summary, words, tags, status, stats: replies, views, likes
* Tag Prefixes: forum, section, freeform

XenForo is commercial forum software, popular in some fanfiction
communities.  Current support has been tested with instances of XenForo 2.0
and 2.1.  Some support may also be available for 1.x.  Sites that have been
tested are: spacebattles.com, sufficientvelocity.com,
questionablequesting.com, and alternativehistory.com.  Summaries are only
available on tag pages and search results and are a truncated copy of the
first post.  Views and likes are not available for tag and search listings.
XenForo stats are not merge, due to the rather large difference in meaning
between those on a forum site and those on an archive site.

## Adding a New Site

If you want to add support for a new site, either as a PR to this module or as
a stand alone module, there are some details to pay attention to:

Unsurprisingly, sites are instances of the `Site` class.  The individual
site modules are expected to have an instance of themselves as the default
export.  That object should have a `Class` property with the class used to
construct it.  If the site uses a custom fic class it should have a `Fic`
property with that.


