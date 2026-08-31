import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
// Static, top-level imports - this config file only ever runs in Node
// (never bundled to the browser), so there's no reason these needed to be
// dynamic. Re-resolving them on every single request (the previous
// `await import(...)` inside each handler) was interacting badly with
// Windows' case-insensitive filesystem and Vite's file watcher, causing a
// restart loop: Vite kept flagging these files as "changed" and restarting
// itself faster than it could finish. Importing once, here, removes the
// repeated re-resolution entirely.
import { handleChatRequest } from './api/_lib/chatHandler.js';
import { handleContactRequest } from './api/_lib/contactHandler.js';
import { sendRegistrationNotification } from './api/_lib/notifyHandler.js';
import { sendLoanApplicationNotification } from './api/_lib/loanNotifyHandler.js';
import { getGuarantorResponseDetails, submitGuarantorResponse } from './api/_lib/guarantorResponseHandler.js';

// Dev-only middleware that calls the SAME handleChatRequest() used by
// api/chat.js in production, so the chatbot works under plain `npm run dev`
// and can never silently drift from prod behaviour. `apply: 'serve'` means
// this never runs during `vite build`.
function mistralChatDevProxy(env: Record<string, string>): Plugin {
  return {
    name: 'mistral-chat-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { messages } = JSON.parse(body || '{}');

            const apiKey = env.MISTRAL_API_KEY;
            if (!apiKey) {
              console.error(
                '[mistral-chat-dev-proxy] MISTRAL_API_KEY is not set. Add it to a .env.local file at your project root (MISTRAL_API_KEY=your_key_here), no VITE_ prefix, then restart `npm run dev`.'
              );
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Chat service is not configured' }));
              return;
            }

            const clientId = (req.socket as any)?.remoteAddress || 'local-dev';
            const { reply } = await handleChatRequest(messages, apiKey, clientId);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ reply }));
          } catch (error: any) {
            console.error('[mistral-chat-dev-proxy] error:', error);
            res.statusCode = error?.status || 500;
            res.end(JSON.stringify({ error: error?.message || 'Failed to reach chat service' }));
          }
        });
      });
    },
  };
}

// Dev-only middleware mirroring api/contact.js, same reasoning as the chat proxy above.
function contactDevProxy(env: Record<string, string>): Plugin {
  return {
    name: 'contact-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/contact', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsedBody = JSON.parse(body || '{}');

            const gmailUser = env.GMAIL_USER;
            const gmailAppPassword = env.GMAIL_APP_PASSWORD;
            if (!gmailUser || !gmailAppPassword) {
              console.error(
                '[contact-dev-proxy] GMAIL_USER or GMAIL_APP_PASSWORD is not set. Add both to .env.local, no VITE_ prefix, then restart `npm run dev`.'
              );
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Contact service is not configured' }));
              return;
            }

            const result = await handleContactRequest(parsedBody, { gmailUser, gmailAppPassword });

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (error: any) {
            console.error('[contact-dev-proxy] error:', error);
            res.statusCode = error?.status || 500;
            res.end(JSON.stringify({ error: error?.message || 'Failed to send message' }));
          }
        });
      });
    },
  };
}

// Dev-only middleware mirroring api/notify-registration.js, same reasoning as the proxies above.
function notifyRegistrationDevProxy(env: Record<string, string>): Plugin {
  return {
    name: 'notify-registration-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/notify-registration', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsedBody = JSON.parse(body || '{}');

            const gmailUser = env.GMAIL_USER;
            const gmailAppPassword = env.GMAIL_APP_PASSWORD;
            if (!gmailUser || !gmailAppPassword) {
              console.error(
                '[notify-registration-dev-proxy] GMAIL_USER or GMAIL_APP_PASSWORD is not set. Add both to .env.local, no VITE_ prefix, then restart `npm run dev`.'
              );
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Notification service is not configured' }));
              return;
            }

            const result = await sendRegistrationNotification(parsedBody, { gmailUser, gmailAppPassword });

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (error: any) {
            console.error('[notify-registration-dev-proxy] error:', error);
            res.statusCode = error?.status || 500;
            res.end(JSON.stringify({ error: error?.message || 'Failed to send notification' }));
          }
        });
      });
    },
  };
}

// Dev-only middleware mirroring api/notify-loan-application.js, same reasoning as the proxies above.
function notifyLoanDevProxy(env: Record<string, string>): Plugin {
  return {
    name: 'notify-loan-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/notify-loan-application', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsedBody = JSON.parse(body || '{}');

            const gmailUser = env.GMAIL_USER;
            const gmailAppPassword = env.GMAIL_APP_PASSWORD;
            if (!gmailUser || !gmailAppPassword) {
              console.error(
                '[notify-loan-dev-proxy] GMAIL_USER or GMAIL_APP_PASSWORD is not set. Add both to .env.local, no VITE_ prefix, then restart `npm run dev`.'
              );
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Notification service is not configured' }));
              return;
            }

            const result = await sendLoanApplicationNotification(parsedBody, { gmailUser, gmailAppPassword });

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (error: any) {
            console.error('[notify-loan-dev-proxy] error:', error);
            res.statusCode = error?.status || 500;
            res.end(JSON.stringify({ error: error?.message || 'Failed to send notification' }));
          }
        });
      });
    },
  };
}

// Dev-only middleware mirroring api/guarantor-response-details.js. Read-only
// (fetches the snapshot a guarantor sees before deciding), so unlike the
// other proxies it needs no Gmail credentials - only Supabase, via
// getSupabaseAdmin() reading process.env directly (see the
// Object.assign(process.env, env) call below defineConfig - that's what
// makes SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY reachable here at all).
function guarantorResponseDetailsDevProxy(): Plugin {
  return {
    name: 'guarantor-response-details-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/guarantor-response-details', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { token } = JSON.parse(body || '{}');
            const details = await getGuarantorResponseDetails(token);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(details));
          } catch (error: any) {
            console.error('[guarantor-response-details-dev-proxy] error:', error);
            res.statusCode = error?.status || 500;
            res.end(JSON.stringify({ error: error?.message || 'Failed to load this request' }));
          }
        });
      });
    },
  };
}

// Dev-only middleware mirroring api/guarantor-response-submit.js, same
// reasoning as the proxies above. Needs Gmail credentials too, since a
// successful submission emails the loanee and SHG office.
function guarantorResponseSubmitDevProxy(env: Record<string, string>): Plugin {
  return {
    name: 'guarantor-response-submit-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/guarantor-response-submit', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsedBody = JSON.parse(body || '{}');

            const gmailUser = env.GMAIL_USER;
            const gmailAppPassword = env.GMAIL_APP_PASSWORD;
            if (!gmailUser || !gmailAppPassword) {
              console.error(
                '[guarantor-response-submit-dev-proxy] GMAIL_USER or GMAIL_APP_PASSWORD is not set. Add both to .env.local, no VITE_ prefix, then restart `npm run dev`.'
              );
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Notification service is not configured' }));
              return;
            }

            const result = await submitGuarantorResponse(parsedBody, { gmailUser, gmailAppPassword });

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (error: any) {
            console.error('[guarantor-response-submit-dev-proxy] error:', error);
            res.statusCode = error?.status || 500;
            res.end(JSON.stringify({ error: error?.message || 'Failed to submit your response' }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Loads .env / .env.local without the VITE_ prefix restriction, for server-only use
  // inside this config file. This value never reaches client-side code.
  const env = loadEnv(mode, process.cwd(), '');

  // Everything above reads its credentials by explicitly destructuring them
  // off `env` and passing them as function arguments (env.GMAIL_USER, etc.) -
  // that pattern works fine for those handlers. But supabaseAdmin.js and
  // guarantorTokens.js read process.env.SUPABASE_URL / .SUPABASE_SERVICE_ROLE_KEY
  // / .GUARANTOR_TOKEN_SECRET directly, the same way they do in real Vercel
  // production (where env vars are injected into process.env ambiently).
  // Without this line, `env` stays a local variable that those two files can
  // never see, no matter what's correctly sitting in .env.local - which is
  // exactly what caused "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not
  // set on the server" even with a correct .env.local. This line makes local
  // dev match production's ambient process.env behavior instead of adding
  // yet another explicit-parameter path for just these three vars.
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      mistralChatDevProxy(env),
      contactDevProxy(env),
      notifyRegistrationDevProxy(env),
      notifyLoanDevProxy(env),
      guarantorResponseDetailsDevProxy(),
      guarantorResponseSubmitDevProxy(env),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});