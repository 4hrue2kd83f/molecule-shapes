// Copyright 2014-2019, University of Colorado Boulder

/**
 * Provides access to renderer-specific textures which are otherwise identical. We can't share textures across
 * three.js renderers, so we must resort to making one copy per renderer.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );

  /*
   * @constructor
   * @param {() => {THREE.Texture}} textureFactory - Creates a texture whenever needed (for each renderer)
   */
  function LocalTexture( textureFactory ) {
    this.textureFactory = textureFactory; // @private {() => {THREE.Texture}}

    // renderers[i] "owns" textures[i]
    this.renderers = []; // @private {Array.<THREE.Renderer>}
    this.textures = []; // @private {Array.<THREE.Texture>}
  }

  moleculeShapes.register( 'LocalTexture', LocalTexture );

  return inherit( Object, LocalTexture, {
    /**
     * Returns the copy of the texture corresponding to the provided three.js renderer.
     * @public
     *
     * @param {THREE.Renderer} renderer
     * @returns {THREE.Texture}
     */
    get: function( renderer ) {
      for ( let i = 0; i < this.renderers.length; i++ ) {
        if ( this.renderers[ i ] === renderer ) {
          return this.textures[ i ];
        }
      }

      this.renderers.push( renderer );
      const material = this.textureFactory();
      this.textures.push( material );

      return material;
    }
  } );
} );
