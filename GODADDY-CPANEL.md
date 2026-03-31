# GoDaddy cPanel Deployment

Este repo no se despliega en GoDaddy cPanel como sitio plano dentro de `public_html`.
Es una app `Next.js` con rutas API, por lo que debe correr como aplicacion `Node.js`.

## Lo que si sirve

1. Activa `SSH` en GoDaddy.
2. En cPanel usa `Node.js Application Manager`.
3. Clona el repo en tu home, por ejemplo `~/client-dcs`.
4. Configura las variables de entorno del archivo [`./.env.example`](./.env.example).
5. Instala dependencias y compila:

```bash
cd ~/client-dcs
npm install
npm run build
```

6. En la app Node de cPanel usa:

- Application root: `client-dcs`
- Application URL: tu dominio o subdominio
- Application startup file: `server.js`
- Node.js version: la LTS mas reciente que GoDaddy permita

7. Reinicia la app desde cPanel.

## Si solo quieres subir el showroom estatico

Si tu idea era subir solo una carpeta publica estilo `public_html`, entonces no subas todo el repo.
Sube solo:

- [`public_html/showroom/index.html`](./public_html/showroom/index.html)
- [`public_html/showroom/.htaccess`](./public_html/showroom/.htaccess)

Eso si funciona como instalacion estatica en GoDaddy cPanel.
