# QR Code Designer

A playful, browser-based QR code studio that lets you create, customize, preview, and export QR codes — without needing a backend or an account.

**[Live Demo](https://qr-code-generator-gamma-six.vercel.app/)**

## Overview

QR Code Designer is a responsive web application built to make QR code creation more flexible and visually engaging. Instead of generating plain black-and-white codes, users can choose different content types, experiment with visual styles, adjust error-correction settings, and preview their changes in real time.

The interface features a pastel-pink aesthetic, playful typography, and a modern design focused on making customization intuitive.

## Features

### 1. Multiple QR Code Types

Generate QR codes for different kinds of information:

* **URL:** Encode website addresses.
* **Plain Text:** Turn text into a scannable QR code.
* **Email:** Include an email address, subject, and message.
* **Phone Number:** Encode a phone number.
* **Wi-Fi:** Share network credentials, security settings, and hidden-network information.

The input fields adapt to the selected QR code type, with validation for incomplete or invalid information.

### 2. Real-Time Preview and Customization

Customize your QR code and see the changes reflected immediately.

* Adjustable output size.
* Custom foreground and background colors.
* Optional gradient colors and gradient direction.
* Multiple module patterns: square, rounded, dots, and diamond.
* Customizable corner-eye shapes.
* Adjustable error-correction levels: L, M, Q, and H.
* Configurable quiet-zone margin.

### 3. Presets

Choose from predefined styles to get started quickly, including Classic, Ink, Ocean, Sunset, Forest, and Neon. Each preset can be further customized to suit your preferences.

### 4. Download and Share

* Download QR codes as **PNG** or **SVG**.
* Copy the generated QR code image to the clipboard where supported.
* Upload a custom logo and adjust its size.
* Reuse saved QR codes instead of recreating them from scratch.

### 5. Scan-Reliability Checks

Visual customization should not come at the expense of usability. The app checks QR code settings and displays warnings for potentially problematic choices, including low contrast, insufficient margins, dense codes, and logo coverage.

Where the browser supports the Barcode Detection API, the app also attempts to verify that the generated QR code can be decoded.

*These checks help identify potential issues but cannot guarantee that every QR code will scan on every device.*

### 6. Recently Generated QR Codes

Recently saved, downloaded, or copied QR codes can be accessed from the Recent section.

* Restore a previous code and its settings.
* Retain recent entries after refreshing the page.
* Clear the saved history when needed.

Recent codes and the selected theme are stored locally in the browser.

### 7. Responsive Interface and Themes

* Responsive layout for desktop and mobile screens.
* Light and dark themes.
* Interactive visual elements and playful styling.
* No account or backend required.

## Tech Stack

| Technology         | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| React              | Component-based user interface                             |
| TypeScript         | Type safety and maintainable code                          |
| Vite               | Development server and build tooling                       |
| HTML5              | Application entry point and document structure             |
| CSS3               | Responsive layouts, themes, animations, and visual styling |
| `qrcode-generator` | QR code generation                                         |

## Available Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the local development server   |
| `npm run build`     | Build the application for production |
| `npm run preview`   | Preview the production build locally |
| `npm test`          | Run the test suite                   |
| `npm run typecheck` | Check TypeScript types               |

## Project Structure

```text
QR-Code-generator/
├── src/
│   ├── lib/
│   │   └── qr.ts       # QR generation, validation and scan checks
│   ├── App.tsx         # Main application and state management
│   ├── ui.tsx          # Reusable UI components
│   ├── Fx.tsx          # Visual effects and interactions
│   ├── styles.css      # Styling and responsive layouts
│   └── main.tsx        # Application entry point
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Testing Checklist

The following checks are useful when verifying the application:

* [ ] Generate QR codes for all five supported content types.
* [ ] Verify validation messages for invalid or incomplete inputs.
* [ ] Test color, gradient, pattern, size, margin, and error-correction settings.
* [ ] Apply presets and confirm that their settings remain editable.
* [ ] Download PNG and SVG files and verify that they encode the expected content.
* [ ] Test logo uploads and clipboard copying.
* [ ] Check scan reliability with different customization settings and devices.
* [ ] Refresh the page and verify that recent QR codes and theme preferences persist.
* [ ] Test the interface at desktop and mobile screen sizes.
* [ ] Run the automated tests, production build, and TypeScript check.

## Privacy

QR code generation runs in the browser, and the application does not require a backend or account. Recent QR codes and theme preferences are stored in browser local storage. Avoid saving sensitive information on shared devices, and clear local history when necessary.

## About

Developed as a frontend task for **Google Developer Groups (GDG) SRM recruitment**, by **Kumari Akshara**.

