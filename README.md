configured-rate-limiter
=======================

This is a wrapper around [node-rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible) to work in the
[@gasbuddy/service](https://github.com/gas-buddy/service) opinionated service
framework which uses Redis for other things. While the primary use is inside our
[Ambassador](https://www.getambassador.io/) based external-auth service, it is
useful to use the module in clients directly so that you can take advantage
of in-process caching for blocked users and to avoid unnecessary network traffic when a simple front-end rate limiter isn't enough.