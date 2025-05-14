# Technical Context: Custom Spells 5e

## Core Technologies
- **FoundryVTT** (v10+)
- **JavaScript** (ES6+)
- **Handlebars** (templating)
- **CSS** (styling)
- **JSON** (configuration)

## Development Setup
1. **Module Structure**
   - Foundry module manifest (module.json)
   - Standard Foundry module directory layout
   - Localization support (lang/en.json)

2. **Dependencies**
   - Foundry core APIs
   - D&D5e system APIs
   - No external npm dependencies

3. **Build Process**
   - No build step required
   - Direct file editing
   - Browser-based debugging

4. **Testing Approach**
   - Manual testing in Foundry
   - Console debugging
   - Foundry's built-in logging

## Key Technical Constraints
1. Must maintain FoundryVTT compatibility
2. Limited to Foundry's security sandbox
3. Must work within D&D5e system rules
4. Performance considerations for large spell lists
