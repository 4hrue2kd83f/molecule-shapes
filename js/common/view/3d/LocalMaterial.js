// Copyright 2014-2019, University of Colorado Boulder

/**
 * Provides access to renderer-specific materials which are otherwise identical. We can't share materials across
 * three.js renderers, so we must resort to making one copy per renderer.
 *
 * Also provides ways to modify every copied material when uniforms/etc. needs to be changed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inherit from '../../../../../phet-core/js/inherit.js';
import merge from '../../../../../phet-core/js/merge.js';
import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';

/*
 * @constructor
 * @param {THREE.Material} masterMaterial - The material to clone for each renderer
 */
function LocalMaterial( masterMaterial, options ) {
  const self = this;

  options = merge( {
    // default options?
  }, options );

  this.masterMaterial = masterMaterial; // @private {THREE.Material}

  // renderers[i] "owns" materials[i]
  this.renderers = []; // @private {Array.<THREE.Renderer>}
  this.materials = []; // @private {Array.<THREE.Material>}

  if ( options.color ) {
    MoleculeShapesGlobals.toColorProperty( options.color ).link( function( color ) {
      self.setColor( color );
    } );
  }
  // assumes RGB
  if ( options.uniformColor ) {
    MoleculeShapesGlobals.toColorProperty( options.uniformColor ).link( function( color ) {
      self.setUniformColor( color );
    } );
  }
}

moleculeShapes.register( 'LocalMaterial', LocalMaterial );

export default inherit( Object, LocalMaterial, {
  /**
   * Returns the copy of the material corresponding to the provided three.js renderer.
   * @public
   *
   * @param {THREE.Renderer} renderer
   * @returns {THREE.Material}
   */
  get: function( renderer ) {
    for ( let i = 0; i < this.renderers.length; i++ ) {
      if ( this.renderers[ i ] === renderer ) {
        return this.materials[ i ];
      }
    }

    this.renderers.push( renderer );
    const material = this.masterMaterial.clone();
    this.materials.push( material );

    return material;
  },

  /**
   * Sets the uniform value for the WebGL shader based on THREE.js's support for uniform values.
   * @public
   *
   * @param {string} name
   * @param {*} value
   */
  setUniform: function( name, value ) {
    this.masterMaterial.uniforms[ name ].value = value;
    _.each( this.materials, function( material ) { material.uniforms[ name ].value = value; } );
  },

  /**
   * Sets the color for the materials (master material and the copies).
   * @public
   *
   * @param {Color} color
   */
  setColor: function( color ) {
    const hex = color.toNumber();
    this.masterMaterial.color.setHex( hex );
    _.each( this.materials, function( material ) { material.color.setHex( hex ); } );
  },

  /**
   * Sets the uniform color for all materials.
   * @public
   *
   * @param {Color} color
   */
  setUniformColor: function( color ) {
    const colorArray = [ color.r / 255, color.g / 255, color.b / 255 ];
    this.setUniform( 'color', colorArray );
  }
} );