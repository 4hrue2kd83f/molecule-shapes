// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of the angle (sector and line) between two bonds, written in three.js so it can be displayed with Canvas instead
 * of WebGL (works for both). Less efficient that BondAngleWebGLView, since we need to update the vertices on the CPU
 * and push them over to the GPU.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var BondAngleView = require( 'MOLECULE_SHAPES/common/view/3d/BondAngleView' );

  function createArcGeometry( vertices ) {
    var geometry = new THREE.Geometry();

    for ( var i = 0; i < vertices.length; i++ ) {
      geometry.vertices.push( vertices[i] );
    }
    geometry.dynamic = true; // so we can be updated

    return geometry;
  }

  function createSectorGeometry( vertices ) {
    var geometry = new THREE.Geometry();

    // center
    geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    for ( var i = 0; i < vertices.length; i++ ) {
      // unclear whether concat would be supported
      geometry.vertices.push( vertices[i] );
    }
    // faces
    for ( var j = 0; j < vertices.length - 1; j++ ) {
      geometry.faces.push( new THREE.Face3( 0, j + 1, j + 2 ) );
    }
    geometry.dynamic = true; // so we can be updated

    return geometry;
  }

  var numVertices = 24;

  function BondAngleFallbackView( screenView, showBondAnglesProperty, molecule, aGroup, bGroup, label ) {
    BondAngleView.call( this, screenView, showBondAnglesProperty, molecule, aGroup, bGroup, label );

    // shared vertex array between both geometries
    this.arcVertices = [];
    for ( var i = 0; i < numVertices; i++ ) {
      this.arcVertices.push( new THREE.Vector3() );
    }

    // geometries on each instance, since we need to modify them directly
    this.arcGeometry = createArcGeometry( this.arcVertices );
    this.sectorGeometry = createSectorGeometry( this.arcVertices );

    this.sectorMaterial = new THREE.MeshBasicMaterial( {
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
      overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.1
    } );
    this.unlinkSectorColor = MoleculeShapesGlobals.linkColor( this.sectorMaterial, MoleculeShapesColors.bondAngleSweepProperty );
    this.arcMaterial = new THREE.LineBasicMaterial( {
      transparent: true,
      opacity: 0.7,
      depthWrite: false // don't write depth values, so we don't cause other transparent objects to render
    } );
    this.unlinkArcColor = MoleculeShapesGlobals.linkColor( this.arcMaterial, MoleculeShapesColors.bondAngleArcProperty );

    this.sectorView = new THREE.Mesh( this.sectorGeometry, this.sectorMaterial );
    this.arcView = new THREE.Line( this.arcGeometry, this.arcMaterial );

    // render the bond angle views on top of everything (but still depth-testing), with arcs on top
    this.sectorView.renderDepth = 10;
    this.arcView.renderDepth = 11;

    this.add( this.sectorView );
    this.add( this.arcView );
  }

  return inherit( BondAngleView, BondAngleFallbackView, {
    dispose: function() {
      BondAngleView.prototype.dispose.call( this );

      this.arcGeometry.dispose();
      this.sectorGeometry.dispose();
      this.arcMaterial.dispose();
      this.sectorMaterial.dispose();

      this.unlinkSectorColor();
      this.unlinkArcColor();
    },

    updateView: function( lastMidpoint, localCameraOrientation ) {
      BondAngleView.prototype.updateView.call( this, lastMidpoint, localCameraOrientation );

      this.sectorMaterial.opacity = this.viewOpacity / 2;
      this.arcMaterial.opacity = this.viewOpacity * 0.7;

      // update the vertices based on our GLSL shader
      for ( var i = 0; i < numVertices; i++ ) {
        var ratio = i / ( numVertices - 1 ); // zero to 1

        // map our midpoint to theta=0
        var theta = ( ratio - 0.5 ) * this.viewAngle;

        // use our basis vectors to compute the point
        var position = this.midpointUnit.times( Math.cos( theta ) ).plus( this.planarUnit.times( Math.sin( theta ) ) ).times( BondAngleView.radius );

        var vertex = this.arcVertices[i];
        vertex.x = position.x;
        vertex.y = position.y;
        vertex.z = position.z;
      }

      // let three.js know that the vertices need to be updated
      this.arcGeometry.verticesNeedUpdate = true;
      this.sectorGeometry.verticesNeedUpdate = true;
    }
  } );
} );