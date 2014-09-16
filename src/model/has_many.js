import Coalesce from '../namespace';
import Relationship from './relationship';
import HasManyArray from '../collections/has_many_array';
import isEqual from '../utils/is_equal';
import copy from '../utils/copy';

var defaults = _.defaults;

export default class HasMany extends Relationship {
  
  constructor(name, options) {
    defaults(options, {collectionType: HasManyArray});
    super(name, options);
  }
  
  defineProperty(prototype) {
    var name = this.name;
    var field = this;
    Object.defineProperty(prototype, name, {
      enumerable: true,
      get: function() {
        var value = this._relationships[name];
        if(this.isNew && !value) {
          var content = value;
          value = this._relationships[name] = new field.collectionType();
          value.owner = this;
          value.name = name;
          if(content) {
            value.addObjects(content);
          }
        }
        return value;
      },
      set: function(value) {
        var oldValue = this._relationships[name];
        if(oldValue === value) return;
        if(value && value instanceof field.collectionType) {
          // XXX: this logic might not be necessary without Ember
          // need to copy since this content is being listened to
          value = copy(value);
        }
        if(oldValue && oldValue instanceof field.collectionType) {
          oldValue.clear();
          if(value) {
            oldValue.addObjects(value);
          }
        } else {
          this.hasManyWillChange(name);
          
          var content = value;
          value = this._relationships[name] = new field.collectionType();
          value.owner = this;
          value.name = name;
          if(content) {
            value.addObjects(content);
          }
          this.hasManyDidChange(name);
        }
        return value;
      }
    });
  }
  
}
