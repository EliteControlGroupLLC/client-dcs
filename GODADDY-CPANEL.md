# GoDaddy cPanel Deployment

Este repo no se despliega en GoDaddy cPanel como sitio plano dentro de `public_html`.
Es una app `Next.js` con rutas API, por lo que debe correr como aplicación `Node.js`.

---

## Error frecuente: Permission denied (publickey)

Si al intentar clonar el repositorio desde cPanel ves este error:

```
"/usr/local/cpanel/3rdparty/bin/git" reported error code "128" when it ended:
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
Please make sure you have the correct access rights and the repository exists.
```

Significa que cPanel está intentando conectarse a GitHub usando el protocolo **SSH**
(`git@github.com:...`) pero el servidor de GoDaddy **no tiene una clave SSH** registrada
en tu cuenta de GitHub.

### Solución A — Clonar con HTTPS (la más sencilla)

En lugar de usar la URL SSH, usa la URL **HTTPS** del repositorio.

1. En cPanel ve a **Git Version Control** y haz clic en **Create**.
2. En el campo **Clone URL** escribe la URL HTTPS del repo:

   ```
   https://github.com/MaxHebeling/client-dcs.git
   ```

3. Si el repositorio es **privado**, GitHub pedirá credenciales. Usa un
   **Personal Access Token (PAT)** en lugar de tu contraseña:
   - En GitHub ve a **Settings → Developer settings → Personal access tokens → Tokens (classic)**.
   - Genera un token con permiso `repo`.
   - Usa tu nombre de usuario de GitHub y el token como contraseña cuando Git lo pida,
     o inclúyelo directamente en la URL:

     ```
     https://<tu-usuario>:<tu-token>@github.com/MaxHebeling/client-dcs.git
     ```

   > **Importante:** No guardes la URL con el token en lugares públicos.

4. Completa el campo **Repository Path** (por ejemplo `/home/<usuario>/client-dcs`) y haz
   clic en **Create**.

### Solución B — Configurar una clave SSH en GoDaddy para GitHub

Si prefieres usar SSH, necesitas crear una clave en el servidor y registrarla en GitHub.

1. Activa **SSH** en GoDaddy y abre una terminal SSH hacia tu hosting.
2. Genera una clave SSH (si no tienes una):

   ```bash
   ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
   # Acepta la ruta predeterminada (~/.ssh/id_ed25519) y deja la contraseña vacía
   ```

3. Copia el contenido de la clave pública:

   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

4. En GitHub ve a **Settings → SSH and GPG keys → New SSH key**, pega la clave y guarda.
5. Desde la terminal SSH de GoDaddy verifica la conexión:

   ```bash
   ssh -T git@github.com
   # Debe responder: Hi <usuario>! You've successfully authenticated...
   ```

6. Ahora ya puedes clonar usando la URL SSH:

   ```bash
   git clone git@github.com:MaxHebeling/client-dcs.git ~/client-dcs
   ```

---

## Despliegue de la aplicación Node.js

1. Activa `SSH` en GoDaddy.
2. En cPanel usa `Node.js Application Manager`.
3. Clona el repo en tu home siguiendo una de las soluciones anteriores, por ejemplo en `~/client-dcs`.
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
- Node.js version: la LTS más reciente que GoDaddy permita

7. Reinicia la app desde cPanel.

---

## Si solo quieres subir el showroom estático

Si tu idea era subir solo una carpeta pública estilo `public_html`, entonces no subas todo el repo.
Sube solo:

- [`public_html/showroom/index.html`](./public_html/showroom/index.html)
- [`public_html/showroom/.htaccess`](./public_html/showroom/.htaccess)

Eso sí funciona como instalación estática en GoDaddy cPanel.
