import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction } from '@remix-run/node'
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    isRouteErrorResponse,
    useRouteError,
} from '@remix-run/react'
import { withEmotionCache } from '@emotion/react'
import { ServerStyleContext, ClientStyleContext } from './context'
import { Box, ChakraProvider, Heading, Text, extendTheme } from '@chakra-ui/react'
import { useContext, useEffect } from 'react'

export const links: LinksFunction = () => [
    ...(cssBundleHref
        ? [
              { rel: 'stylesheet', href: cssBundleHref },
          ]
        : []),
]

interface DocumentProps {
    children: React.ReactNode
}

const Document = withEmotionCache(
    ({ children }: DocumentProps, emotionCache) => {
        const serverStyleData = useContext(ServerStyleContext)
        const clientStyleData = useContext(ClientStyleContext)

        // Only executed on client
        useEffect(() => {
            // re-link sheet container
            emotionCache.sheet.container = document.head
            // re-inject tags
            const tags = emotionCache.sheet.tags
            emotionCache.sheet.flush()
            tags.forEach((tag) => {
                // eslint-disable-next-line no-extra-semi
                ;(emotionCache.sheet as any)._insertTag(tag)
            })
            // reset cache to reapply global styles
            clientStyleData?.reset()
        }, [])

        return (
            <html lang="en">
                <head>
                    <meta charSet="utf-8" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1"
                    />
                    <Meta />
                    <Links />
                    {serverStyleData?.map(({ key, ids, css }) => (
                        <style
                            key={key}
                            data-emotion={`${key} ${ids.join(' ')}`}
                            dangerouslySetInnerHTML={{ __html: css }}
                        />
                    ))}
                </head>
                <body>
                    {children}
                    <ScrollRestoration />
                    <Scripts />
                    <LiveReload />
                </body>
            </html>
        )
    }
)



export default function App() {
    return (
        <Document>
            <ChakraProvider>
                <Outlet />
            </ChakraProvider>
        </Document>
    )
}

  // How ChakraProvider should be used on ErrorBoundary
  export function ErrorBoundary() {
    const error = useRouteError()
    
    if(isRouteErrorResponse(error)){
        return (
            <Document>
                <ChakraProvider>
                    <Box bg={"red.100"} p={4}>
                        <Heading>Oops</Heading>
                        <Text>Status: {error.status}</Text>
                        <Text>{error.data.message}</Text>
                    </Box>
                </ChakraProvider>
            </Document>
        )
    }

// Don't forget to typecheck with your own logic.
// Any value can be thrown, not just errors!
//   let errorMessage = "Unknown error";
//   if (isDefinitelyAnError(error)) {
//     errorMessage = error.message;
//   }

//   return (
//     <div>
//       <h1>Uh oh ...</h1>
//       <p>Something went wrong.</p>
//       <pre>{errorMessage}</pre>
//     </div>
//   );
  }
