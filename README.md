# Symfony in a Service Worker!

## Install

```bash
npm install
```

## Bring Your Own Design System
Customize the Symfony application in `./app` to fit your needs.

### Testing the Symfony Application
The symfony application can be easily tested by using the built-in PHP server.
```bash
cd app && \
composer install --no-dev -o && \
php -S localhost:8888 -t public
```

Now visiting https://localhost:8888 should yield the Symfony front page. Your
twig controller should be accessible at https://localhost:8888/twig/{component_id}.

## Testing Storybook Locally
```bash
npm run watch
```
This will bundle everything necessary to run storybook and start on port 8080.

## Static Site Build
```bash
npm run build
```
This will bundle everything necessary to run storybook and write it to the
`./storybook-static` directory.  This directory can then be deployed anywhere;
see the github action in this repository for a working example of Github Pages.

## Enjoy!
All the power of Twig, but none of the infra headaches!