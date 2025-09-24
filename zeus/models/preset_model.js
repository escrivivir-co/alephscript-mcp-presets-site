// Preset data model - following diogenes pattern

class PresetModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.category = data.category || 'General';
    this.prompt = data.prompt || '';
    this.parameters = data.parameters || {};
    this.tags = data.tags || [];
    this.isPublic = data.isPublic || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.usageCount = data.usageCount || 0;
    this.rating = data.rating || 0;
  }

  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Preset name is required');
    }
    
    if (!this.prompt || this.prompt.trim().length === 0) {
      errors.push('Preset prompt is required');
    }
    
    if (!['General', 'Development', 'Analysis', 'Creative'].includes(this.category)) {
      errors.push('Invalid category');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      prompt: this.prompt,
      parameters: this.parameters,
      tags: this.tags,
      isPublic: this.isPublic,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      usageCount: this.usageCount,
      rating: this.rating
    };
  }

  static fromJSON(data) {
    return new PresetModel(data);
  }

  incrementUsage() {
    this.usageCount += 1;
    this.updatedAt = new Date().toISOString();
  }

  updateRating(newRating) {
    if (newRating >= 0 && newRating <= 5) {
      this.rating = newRating;
      this.updatedAt = new Date().toISOString();
    }
  }
}

module.exports = PresetModel;