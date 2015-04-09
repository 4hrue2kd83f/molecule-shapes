// Copyright 2002-2014, University of Colorado Boulder

/**
 * Global settings and quality information
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var platform = require( 'PHET_CORE/platform' );
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'SCENERY/util/Util' );

  var MoleculeShapesGlobals = new PropertySet( {
    showOuterLonePairs: !!phet.chipper.getQueryParameter( 'showOuterLonePairs' ) || false,
    projectorColors:    !!phet.chipper.getQueryParameter( 'projector' ) || false
  } );

  // polyfill for console.log on IE9, see https://github.com/phetsims/molecule-shapes/issues/108
  if ( platform.ie9 ) {
    window.console = window.console || {};
    window.console.log = window.console.log || function() {};
  }

  return _.extend( MoleculeShapesGlobals, {
    useWebGL: ( phet.chipper.getQueryParameter( 'webgl' ) !== 'false' ) && Util.isWebGLSupported,

    /*
     * Applies color changes to the material's color field, and also does so immediately upon being called.
     *
     * @param {THREE.Material} material
     * @param {Property.<Color>} colorProperty
     * @returns A callback that will unlink
     */
    linkColor: function( material, colorProperty ) {
      var colorListener = function( color ) {
        material.color.setHex( color.toNumber() );
      };
      colorProperty.link( colorListener );
      return function() {
        colorProperty.unlink( colorListener );
      };
    },

    /*
     * Applies color changes to the material's color and ambient fields, and also does so immediately upon being called.
     *
     * @param {THREE.Material} material
     * @param {Property.<Color>} colorProperty
     * @returns A callback that will unlink
     */
    linkColorAndAmbient: function( material, colorProperty ) {
      var colorListener = function( color ) {
        material.color.setHex( color.toNumber() );
        material.ambient.setHex( color.toNumber() );
      };
      colorProperty.link( colorListener );
      return function() {
        colorProperty.unlink( colorListener );
      };
    },

    toColorProperty: function( color ) {
      // for now, cast it into place
      var colorProperty;
      if ( typeof color === 'string' ) {
        color = new Color( color );
      }
      if ( color instanceof Color ) {
        colorProperty = new Property( color );
      }
      else if ( color instanceof Property ) {
        colorProperty = color;
      }
      else {
        throw new Error( 'bad color passed to MoleculeShapesGlobals.toColorProperty' );
      }
      return colorProperty;
    }
  } );
} );