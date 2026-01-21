/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                darkBlue: "#293b64",
                primary: "#23bcef",
            },
        },
    },
    plugins: [],
}
