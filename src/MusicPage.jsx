import './App.css'

function getSpotifyEmbedUrl(value) {
  const trimmedValue = value?.trim() || ''
  if (!trimmedValue) return ''

  const uriMatch = trimmedValue.match(
    /^spotify:(playlist|album|track|episode|show):([A-Za-z0-9]+)$/i
  )
  if (uriMatch) {
    return `https://open.spotify.com/embed/${uriMatch[1]}/${uriMatch[2]}?utm_source=generator`
  }

  try {
    const parsedUrl = new URL(trimmedValue)
    if (!['open.spotify.com', 'www.open.spotify.com'].includes(parsedUrl.hostname)) {
      return ''
    }

    const match = parsedUrl.pathname.match(
      /^\/(?:intl-[a-z]{2}\/)?(?:embed\/)?(playlist|album|track|episode|show)\/([A-Za-z0-9]+)\/?$/i
    )
    if (!match) return ''

    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`
  } catch {
    return ''
  }
}

export default function MusicPage({ playlistUrl = '', cursor = null }) {
  const embedUrl = getSpotifyEmbedUrl(playlistUrl)

  return (
    <div className="site music-page">
      {cursor}
      <header className="site-header music-header">
        <div className="main-brand">
          <a className="logo" href="/">
            <img src="/images/sheida-logo.png" alt="Sheida Design logo" />
          </a>
          <span className="brand-name">Sheida Design</span>
        </div>
        <div className="header-status">
          <span className="status-dot" />
          SIDE A / LISTENING ROOM
        </div>
        <nav className="navigation">
          <a href="/">Archive</a>
          <a href="/#contact">Contact</a>
        </nav>
      </header>

      <main className="music-main">
        <div className="music-page-kicker">
          <span>[ PERSONAL SOUNDTRACK / 01 ]</span>
          <span>PRESS PLAY WHEN READY</span>
        </div>

        <section className="music-intro">
          <p className="section-label">THE LISTENING ROOM</p>
          <h1>
            Things I play
            <br />
            <span>while I make things.</span>
          </h1>
          <p>
            A little soundtrack for looking closer, making things, and letting
            the afternoon drift by.
          </p>
        </section>

        <section className="music-player-layout" aria-label="Spotify music player">
          <div className="walkman-device" aria-hidden="true">
            <div className="walkman-topline">
              <span>SHEIDA</span><span>ARCHIVE</span>
            </div>
            <div className="walkman-brand">SHEIDA ARCHIVE</div>
            <div className="walkman-display">
              <div className="walkman-cassette">
                <span className="cassette-reel cassette-reel-left" />
                <span className="cassette-reel cassette-reel-right" />
                <span className="cassette-window" />
                <span className="cassette-label">SIDE A</span>
              </div>
            </div>
            <div className="walkman-counter">
              <span>PLAY</span><span>00:00</span><span>REC</span>
            </div>
            <div className="walkman-buttons">
              <span>◀◀</span><span>▶</span><span>■</span><span>▶▶</span>
            </div>
            <div className="walkman-wheel" />
            <div className="walkman-bottomline">SHEIDA ARCHIVE</div>
          </div>

          <div className="spotify-player-card">
            <div className="spotify-player-heading">
              <div>
                <p className="section-label">[ NOW SPINNING ]</p>
                <h2>Sheida’s playlist</h2>
              </div>
              <span className="spotify-mark" aria-label="Spotify">●</span>
            </div>

            {embedUrl ? (
              <>
                <iframe
                  title="Spotify playlist player"
                  src={embedUrl}
                  width="100%"
                  height="352"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
                <a className="spotify-open-link" href={playlistUrl} target="_blank" rel="noopener noreferrer">
                  Open playlist in Spotify ↗
                </a>
              </>
            ) : (
              <div className="spotify-empty-state">
                <span className="empty-record">♫</span>
                <h3>The playlist is waiting.</h3>
                <p>Paste your Spotify playlist link under Admin → Music.</p>
                <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">
                  Find it on Spotify ↗
                </a>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="music-footer">
        <a href="/">← Back to the archive</a>
        <span>MADE FOR SLOW AFTERNOONS ✳</span>
      </footer>
    </div>
  )
}
