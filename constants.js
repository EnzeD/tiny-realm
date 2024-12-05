const scale = 3;
const tileWidth = 8;
const tileHeight = 8;
const BASE_SPEED = 40;

// Text size configuration
const TEXT_CONFIG = {
    DEBUG: {
        size: 2 * scale,
        weight: 'normal'
    },
    FPS: {
        size: 6 * scale,
        weight: 'normal'
    },
    WOOD_COUNT: {
        size: 6 * scale,
        weight: 'normal'
    },
    FLOATING_TEXT: {
        size: 6 * scale,
        weight: 'normal'
    },
    COLLECT_PROMPT: {
        size: 6 * scale,
        weight: 'normal'
    }
};

// Text colors
const TEXT_COLORS = {
    main: "#fff1a9",  // Warm white/yellow color
};

// Text shadow configuration
const TEXT_SHADOW = {
    offset: Math.floor(0.75 * scale),
    color: "rgba(0, 0, 0, 0.5)"
};

// UI layout configuration
const UI_CONFIG = {
    padding: 4 * scale,  // Base padding (8 pixels * scale)
    positions: {
        WOOD_COUNT: {
            x: 4 * scale,  // Left padding
            y: 4 * scale   // Top padding
        },
        FPS: {
            x: -4 * scale,  // Right padding (negative for right alignment)
            y: 4 * scale    // Top padding
        },
        COLLECT_PROMPT: {
            x: 0,           // Center
            y: -4 * scale   // Bottom padding (negative for bottom alignment)
        }
    }
};

// Helper function to get font string
function getFont(textType) {
    const config = TEXT_CONFIG[textType];
    if (!config) {
        console.warn(`No text configuration found for ${textType}`);
        return "16px 'Pixelated Elegance'";
    }
    return `${config.weight} ${config.size}px 'Pixelated Elegance'`;
}

// Helper function to draw shadowed text
function drawShadowedText(ctx, text, x, y, options = {}) {
    const originalFillStyle = ctx.fillStyle;
    const originalAlign = ctx.textAlign;
    const originalBaseline = ctx.textBaseline;

    // Apply options
    if (options.font) ctx.font = options.font;
    if (options.align) ctx.textAlign = options.align;
    if (options.baseline) ctx.textBaseline = options.baseline;

    // Draw shadow
    ctx.fillStyle = TEXT_SHADOW.color;
    ctx.fillText(text, Math.floor(x), Math.floor(y + TEXT_SHADOW.offset));

    // Draw main text
    ctx.fillStyle = options.color || TEXT_COLORS.main;  // Use the new color as default
    ctx.fillText(text, Math.floor(x), Math.floor(y));

    // Restore original context properties if they were changed
    if (options.align) ctx.textAlign = originalAlign;
    if (options.baseline) ctx.textBaseline = originalBaseline;
    ctx.fillStyle = originalFillStyle;
}