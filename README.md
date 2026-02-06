This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Manus IM Build Integration

This repository is connected to Manus IM for automated builds and deployments.

### Build Pipeline

The build pipeline is configured via GitHub Actions and runs automatically on:
- Push to `bizbuildersai` or `main` branches
- Pull requests to `bizbuildersai` or `main` branches
- Manual workflow dispatch

### Configuration Files

- `.github/workflows/manus-im-build.yml` - GitHub Actions workflow for CI/CD
- `manus-im.config.json` - Manus IM specific build configuration
- `.env.example` - Environment variables template for Manus IM integration

### Setup Instructions

1. **Configure GitHub Secrets**: Add the following secrets in your GitHub repository settings:
   - `MANUS_IM_API_KEY` - Your Manus IM API key for authentication
   - `MANUS_IM_ENDPOINT` - Your Manus IM deployment endpoint URL
   - `MANUS_IM_PROJECT_ID` (optional) - Your Manus IM project identifier

2. **Local Development**: 
   ```bash
   npm install
   npm run build
   npm test
   ```

3. **Environment Configuration**:
   - Copy `.env.example` to `.env` for local development
   - Never commit `.env` file (already in .gitignore)

### Build Workflow

1. **Build Job**:
   - Checks out code
   - Sets up Node.js 20
   - Installs dependencies
   - Runs build script
   - Runs tests
   - Uploads build artifacts

2. **Deploy Job** (production only):
   - Downloads build artifacts
   - Deploys to Manus IM using configured endpoint
   - Runs only on push to main branches

### Customization

Edit the following files to customize the build process:
- `manus-im.config.json` - Adjust Manus IM specific settings
- `.github/workflows/manus-im-build.yml` - Modify the CI/CD pipeline

### Support

For issues with the build integration, check:
1. GitHub Actions logs in the "Actions" tab
2. Manus IM dashboard for deployment status
3. Repository secrets configuration
