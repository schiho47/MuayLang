import * as React from 'react'

export default function Root() {
  return (
    <html>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {/*
          Main and Scripts are not defined. 
          In Qwik City, use <Slot /> for content injection and qwikcity/provider for scripts.
        */}
        <slot />
      </body>
    </html>
  )
}
