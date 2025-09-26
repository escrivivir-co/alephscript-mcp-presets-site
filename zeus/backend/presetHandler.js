const fs = require('fs');
const path = require('path');
const { getConfig } = require('../configs/config-manager');

class PresetHandler {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'configs', 'preset-config.json');
    this.presets = this.loadPresets();
  }

  loadPresets() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        const config = JSON.parse(data);
        return config.presets || [];
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
    return [];
  }

  savePresets() {
    try {
      const config = {
        presets: this.presets,
        categories: ["General", "Development", "Analysis", "Creative"],
        defaultPreset: null,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving presets:', error);
      return false;
    }
  }

  getAllPresets() {
    return this.presets;
  }

  getPresetById(id) {
    return this.presets.find(preset => preset.id === id);
  }

  createPreset(presetData) {
    const newPreset = {
      id: Date.now().toString(),
      name: presetData.name,
      description: presetData.description || '',
      category: presetData.category || 'General',
      prompt: presetData.prompt || '',
      parameters: presetData.parameters || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.presets.push(newPreset);
    this.savePresets();
    return newPreset;
  }

  updatePreset(id, updateData) {
    const presetIndex = this.presets.findIndex(preset => preset.id === id);
    if (presetIndex === -1) {
      return null;
    }

    this.presets[presetIndex] = {
      ...this.presets[presetIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.savePresets();
    return this.presets[presetIndex];
  }

  deletePreset(id) {
    const presetIndex = this.presets.findIndex(preset => preset.id === id);
    if (presetIndex === -1) {
      return false;
    }

    this.presets.splice(presetIndex, 1);
    this.savePresets();
    return true;
  }

  searchPresets(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.presets.filter(preset => 
      preset.name.toLowerCase().includes(lowercaseQuery) ||
      preset.description.toLowerCase().includes(lowercaseQuery) ||
      preset.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  importPresets(presetsArray, overwrite = false) {
    const results = {
      imported: 0,
      skipped: 0,
      errors: 0,
      details: []
    };

    presetsArray.forEach(presetData => {
      try {
        // Check if preset already exists
        const existingPreset = this.presets.find(p => 
          p.name === presetData.name || p.id === presetData.id
        );

        if (existingPreset && !overwrite) {
          results.skipped++;
          results.details.push(`Skipped: ${presetData.name} (already exists)`);
          return;
        }

        // Create or update preset
        if (existingPreset && overwrite) {
          this.updatePreset(existingPreset.id, presetData);
          results.imported++;
          results.details.push(`Updated: ${presetData.name}`);
        } else {
          this.createPreset(presetData);
          results.imported++;
          results.details.push(`Imported: ${presetData.name}`);
        }
      } catch (error) {
        results.errors++;
        results.details.push(`Error: ${presetData.name} - ${error.message}`);
      }
    });

    return results;
  }
}

module.exports = PresetHandler;