# System Patterns: Custom Spells 5e

## Architecture Overview
1. **Main Module** (custom-spells.js)
   - Foundry module initialization
   - Hooks and event listeners
   - API endpoints

2. **UI Layer**
   - Handlebars templates (templates/)
   - CSS styling (css/)
   - Localization (lang/)

3. **Data Layer**
   - Spell templates (templates/)
   - Compendium integration (packs/)
   - Excel/CSV import (data files)

## Key Patterns
### JavaScript Patterns
- Foundry module lifecycle hooks
- Class-based organization
- Event-driven architecture
- Asynchronous data operations

### Template Patterns
- Handlebars for dynamic UI
- Data binding between JS and templates
- Modular template components

### Data Flow
1. User interacts with template
2. Data sent to JavaScript controller
3. Validation and processing
4. Saved to Foundry document system
5. Available in compendium

## Integration Points
- D&D5e system API
- Foundry core document system
- Compendium architecture
- Module settings API
