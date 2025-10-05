# Web Automation LLM

A powerful web automation tool that uses Large Language Models (LLMs) to intelligently plan and execute web tasks based on natural language goals.

## 🎥 Demo

![Demo Video] https://youtu.be/Hpkqdg9mDKo
*Watch the demo above to see the tool in action!*

## ✨ Features

- **Natural Language Goals**: Describe what you want to accomplish in plain English
- **LLM-Powered Planning**: Uses Groq LLM to create intelligent automation plans
- **Multi-Site Support**: Built-in adapters for Amazon, DemoBlaze, and generic sites
- **Headless/Headed Mode**: Run with or without visible browser window
- **Intelligent Decision Making**: LLM makes real-time choices during automation
- **Playwright Integration**: Modern, reliable browser automation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Groq API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/web-automation-llm.git
cd web-automation-llm

# Install dependencies
npm install

# Set up your Groq API key
echo "GROQ_API_KEY=your_api_key_here" > .env
```

### Usage

```bash
# Basic usage with natural language goal
npm run dev "find a laptop under $800 with 8GB RAM"

# Target specific site
npm run dev "buy a smartphone" --site amazon

# Run with visible browser
npm run dev "test the demo site" --site demoblaze --headed

# Generic site automation
npm run dev "fill out the contact form" --site generic
```

##  Examples

### Amazon Shopping
```bash
npm run dev "find wireless headphones with noise cancellation under $200" --site amazon
```

### DemoBlaze Testing
```bash
npm run dev "add items to cart and complete checkout" --site demoblaze --headed
```

### Generic Site Automation
```bash
npm run dev "navigate to the about page and extract company information" --site generic
```

## 🏗️ Architecture

```
src/
├── index.js              # Main entry point
├── planner.js            # LLM planning and decision making
├── executor/
│   ├── browser.js        # Browser management
│   ├── plan.js           # Plan execution engine
│   ├── amazon.js         # Amazon-specific automation
│   └── demoblaze.js      # DemoBlaze-specific automation
├── selectors/            # Site-specific selectors
└── utils/                # Logging and parsing utilities
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```


##  Development

### Project Structure

- **Planner**: Uses Groq LLM to create automation plans
- **Executor**: Executes plans using Playwright
- **Site Adapters**: Specialized automation for specific websites
- **Utilities**: Logging, parsing, and helper functions

##  Dependencies

- **Playwright**: Browser automation
- **Groq SDK**: LLM integration
- **Yargs**: Command line argument parsing
- **Chalk**: Terminal styling
- **Dotenv**: Environment variable management
