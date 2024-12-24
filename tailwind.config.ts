import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px',
			'3xl': '1600px',
  		}
  	},
  	extend: {
  		gradientColorStops: '(theme) => ({\r\n				"custom-gradient-start": "#001FCC",\r\n				"custom-gradient-end": "#9D00FF",\r\n				"custom-bg-gradient-start": "#001FCC19",\r\n				"custom-bg-gradient-end": "#9D00FF19",\r\n			})',
  		linearGradientDirections: {
  			'top-right': 'to top right'
  		},
  		linearGradientColors: '(theme: (arg0: string) => any) => ({\r\n				"custom-gradient": [\r\n					theme("colors.custom-gradient-start"),\r\n					theme("colors.custom-gradient-end"),\r\n				],\r\n			})',
  		colors: {
  			zikoroBlue: 'hsl(var(--zblue))',
  			basePrimary: '#001FCC',
  			basebody: '#f3f3f3',
  			baseBg: '#F9FAFF',
  			ticketColor: '#CFCFCF',
  			greyBlack: '#0A0E2E',
  			earlyBirdColor: '#001FCC',
  			ash: '#717171',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		screens: {
  			xs: '380px'
  		},
  		backgroundImage: {
  			basePrimary: 'linear-gradient(to right, #001FCC 0%, #9D00FF 100%)',
  			baseLight: 'linear-gradient(to right, #E2E8F0 0%, #D8B4FE 100%)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontSize: {
  			tiny: '10px',
  			mobile: '13px',
  			desktop: '15px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
