var get = Ember.get, set = Ember.set;

/**
  This default merge strategy is not version aware. It
  uses a set to break cycles in the merge.
*/
Ep.Theirs = Ep.MergeStrategy.extend({

  init: function() {
    this.cache = Ep.ModelSet.create();
  },

  merge: function(model, dest) {
    if(this.cache.contains(model)) return dest;
    this.cache.addObject(model);
    dest.beginPropertyChanges();
    this.copyAttributes(model, dest);
    this.copyRelationships(model, dest);
    dest.endPropertyChanges();
    return dest;
  },

  copyAttributes: function(model, dest) {
    model.eachAttribute(function(name, meta) {
      // TODO: handle non-primitive attributes
      var left = get(model, name);
      var right = get(dest, name);
      if(left !== right) set(dest, name, left);
    });
  },

  copyRelationships: function(model, dest) {
    var session = get(this, 'session');
    model.eachRelationship(function(name, relationship) {
      if(relationship.kind === 'belongsTo') {
        var child = get(model, name);
        var destChild = get(dest, name);
        if(child && destChild) {
          session.merge(child, this);
        } else if(child) {
          set(dest, name, session.merge(child, this));
        } else if(dest) {
          set(dest, name, null);
        }
      } else if(relationship.kind === 'hasMany') {
        var children = get(model, name);
        var destChildren = get(dest, name);
        // TODO: merging hasMany's needs to be way better
        destChildren.clear();
        set(destChildren, 'meta', get(children, 'meta'));
        children.forEach(function(child) {
          destChildren.addObject(session.merge(child, this));
        }, this);
      }
    }, this);
  }

});