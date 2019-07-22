'use strict'
const url = require('url')
let Fic

class Site {
  constructor () {
    this.name = undefined
  }
  normalizeLink (href, base) {
    if (!href) return href

    // resolve base url
    if (base) href = url.resolve(base, href)

    // force ssl
    href = href.replace(/^http:/, 'https:')
    href = href.replace(/[/]$/, '')
    return href
  }

  normalizeFicLink (href, base) {
    return this.normalizeLink(href, base)
  }

  normalizeAuthorLink (href, base) {
    return this.normalizeLink(href, base)
  }

  fetchLink (href) {
    return href
  }

  ficLinkFromId (siteId, baseLink) {
    throw new Error('ficLinkFromId is unimplemented')
  }

  newFic (obj) {
    return obj ? new Fic(this).fromJSON(obj) : new Fic(this)
  }

  num (n) {
    if (n == null) return n
    return Number(String(n).trim().replace(/,/g, ''))
  }

  parseScan (scanLink, html) {
    throw new Error(`Parsing fic list pages is unsupported for ${this.name} (${scanLink})`)
  }
}

function parseURL (href) {
  try {
    return url.parse(href)
  } catch (_) {
    return
  }
}

Site.create = function SiteCreate (engine) {
  const link = parseURL(engine)
  if (link && link.hostname) {
    if (link.hostname.includes('archiveofourown.org')) {
      return require('./site/ao3.js')
    } else if (link.hostname.includes('fanfiction.net')) {
      return require('./site/ffnet.js')
    } else if (link.hostname.includes('reddit.com')) {
      return require('./site/reddit.js')
    } else if (link.hostname.includes('scryer.darklordpotter.net')) {
      return require('./site/scryer.js')
    } else if (link.hostname.includes('wattpad.com')) {
      return require('./site/wattpad.js')
    // xenforo checks are necessarily weak and must be last
    } else if (link.pathname.includes('/forums/') || link.pathname.includes('/tags/')) {
      return require('./site/xen.js')
    }
  } else {
    try {
      return require(`./site/${engine}.js`)
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') throw err
      try {
        return require(engine)
      } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') throw err
      }
    }
  }
  throw new Error('Could find site module with: ' + engine)
}

module.exports = Site

Fic = require('./fic.js')
