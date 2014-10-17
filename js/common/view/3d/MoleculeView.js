// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of a Molecule {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var Util = require( 'DOT/Util' );
  var Property = require( 'AXON/Property' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var AtomView = require( 'MOLECULE_SHAPES/common/view/3d/AtomView' );
  var BondView = require( 'MOLECULE_SHAPES/common/view/3d/BondView' );
  var LonePairView = require( 'MOLECULE_SHAPES/common/view/3d/LonePairView' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var BondAngleView = require( 'MOLECULE_SHAPES/common/view/3d/BondAngleView' );
  var BondAngleWebGLView = require( 'MOLECULE_SHAPES/common/view/3d/BondAngleWebGLView' );

  var angleDegreesString = require( 'string!MOLECULE_SHAPES/angle.degrees' );

  // @param {MoleculeShapesScreenView} view
  function MoleculeView( model, view, molecule, labelManager ) {
    THREE.Object3D.call( this );

    assert && assert( labelManager );

    this.model = model;
    this.view = view;
    this.renderer = view.threeRenderer;
    this.molecule = molecule;
    this.labelManager = labelManager;

    this.atomViews = [];
    this.lonePairViews = [];
    this.bondViews = [];
    this.angleViews = [];

    this.radialViews = []; // all views that we would want to drag

    this.lastMidpoint = null;

    molecule.on( 'groupAdded', this.addGroup.bind( this ) );
    molecule.on( 'groupRemoved', this.removeGroup.bind( this ) );
    molecule.on( 'bondAdded', this.addBond.bind( this ) );
    molecule.on( 'bondRemoved', this.removeBond.bind( this ) );

    _.each( molecule.radialGroups, this.addGroup.bind( this ) );
    _.each( molecule.getDistantLonePairs(), this.addGroup.bind( this ) );
    _.each( molecule.getBondsAround( molecule.centralAtom ), this.addBond.bind( this ) );

    if ( molecule.isReal ) {
      this.centerAtomView = new AtomView( this.renderer, AtomView.getElementLocalMaterial( molecule.centralAtom.element ) );
    } else {
      this.centerAtomView = new AtomView( this.renderer, AtomView.centralAtomLocalMaterial );
    }
    this.add( this.centerAtomView );
  }

  return inherit( THREE.Object3D, MoleculeView, {

    updateView: function() {
      for ( var i = 0; i < this.bondViews.length; i++ ) {
        this.bondViews[i].updateView();
      }
      this.updateAngles();
    },

    updateAngles: function() {
      var i;

      // we need to handle the 2-atom case separately for proper support of 180-degree bonds
      var hasTwoBonds = this.molecule.radialAtoms.length === 2;
      if ( !hasTwoBonds ) {
        // if we don't have two bonds, just ignore the last midpoint
        this.lastMidpoint = null;
      }

      for ( i = 0; i < this.angleViews.length; i++ ) {
        var angleView = this.angleViews[i];
        angleView.updateView( this.lastMidpoint );

        // if we have two bonds, store the last midpoint so we can keep the bond midpoint stable
        if ( hasTwoBonds ) {
          this.lastMidpoint = angleView.midpoint.normalized();
        }
      }

      if ( this.model.showBondAngles ) {
        // TODO: we're doing this too much, refactor into one place in MoleculeView!
        var cameraPosition = new THREE.Vector3().copy( MoleculeShapesScreenView.cameraPosition ); // this SETS cameraPosition
        this.worldToLocal( cameraPosition ); // this mutates cameraPosition

        var localCameraPosition = new Vector3( cameraPosition.x, cameraPosition.y, cameraPosition.z ).normalized();

        for ( i = 0; i < this.angleViews.length; i++ ) {
          var bondAngleView = this.angleViews[i];

          var a = bondAngleView.aGroup;
          var b = bondAngleView.bGroup;

          var aDir = a.orientation;
          var bDir = b.orientation;

          var brightness = BondAngleView.calculateBrightness( aDir, bDir, localCameraPosition, this.molecule.radialAtoms.length );
          if ( brightness === 0 ) {
            continue;
          }

          // TODO: cleanup

          var centerPoint = new THREE.Vector3(); // e.g. zero
          var midPoint = new THREE.Vector3( bondAngleView.midpoint.x, bondAngleView.midpoint.y, bondAngleView.midpoint.z );

          this.localToWorld( centerPoint );
          this.localToWorld( midPoint );

          this.view.convertScreenPointFromGlobalPoint( centerPoint );
          this.view.convertScreenPointFromGlobalPoint( midPoint );

          var angle = aDir.angleBetween( bDir ) * 180 / Math.PI;

          this.labelManager.showLabel( StringUtils.format( angleDegreesString, Util.toFixed( angle, 1 ) ), brightness, centerPoint, midPoint );
        }
      }

      this.labelManager.finishedAddingLabels();
    },

    dispose: function() {
      var i;
      for ( i = 0; i < this.atomViews.length; i++ ) {
        this.atomViews[i].dispose();
      }
      for ( i = 0; i < this.bondViews.length; i++ ) {
        this.bondViews[i].dispose();
      }
      for ( i = 0; i < this.angleViews.length; i++ ) {
        this.angleViews[i].dispose();
      }
      for ( i = 0; i < this.lonePairViews.length; i++ ) {
        this.lonePairViews[i].dispose();
      }
      this.centerAtomView.dispose();
      // TODO? See what three.js needs, but also release listeners
    },

    intersect: function( ray3 ) {
      // TODO
    },

    addGroup: function( group ) {
      // ignore the central atom, we add it in the constructor by default
      if ( group === this.molecule.centralAtom ) {
        return;
      }

      var parentAtom = this.molecule.getParent( group );
      var centralAtom = this.molecule.centralAtom;
      if ( group.isLonePair ) {

        var lonePairView = new LonePairView( this.renderer );
        lonePairView.group = group; // TODO: get rid of duck typing
        this.lonePairViews.push( lonePairView );
        this.add( lonePairView );

        // TODO: remove code duplication
        if ( parentAtom === centralAtom ) {
          this.radialViews.push( lonePairView );
        }

        var visibilityProperty = parentAtom === centralAtom ?
                                 this.model.showLonePairsProperty :
                                 MoleculeShapesGlobals.showOuterLonePairsProperty;
        visibilityProperty.linkAttribute( lonePairView, 'visible' );

        group.link( 'position', function( position ) {
          var offsetFromParentAtom = position.minus( parentAtom.position );
          var orientation = offsetFromParentAtom.normalized();

          var translation;
          if ( offsetFromParentAtom.magnitude() > PairGroup.LONE_PAIR_DISTANCE ) {
            translation = position.minus( orientation.times( PairGroup.LONE_PAIR_DISTANCE ) );
          }
          else {
            translation = parentAtom.position;
          }

          lonePairView.position.set( translation.x, translation.y, translation.z );
          lonePairView.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), // rotate from Y_UNIT to the desired orientation
                                                      new THREE.Vector3( orientation.x, orientation.y, orientation.z ) );
        } );
      } else {
        var atomView = new AtomView( this.renderer, group.element ?
                                                    AtomView.getElementLocalMaterial( group.element ) :
                                                    AtomView.atomLocalMaterial );
        atomView.group = group; // TODO: get rid of duck typing
        this.atomViews.push( atomView );
        this.add( atomView );

        if ( parentAtom === centralAtom ) {
          this.radialViews.push( atomView );
        }

        group.link( 'position', function( position ) {
          atomView.position.set( position.x, position.y, position.z );
        } );

        for ( var i = 0; i < this.atomViews.length; i++ ) {
          var otherView = this.atomViews[i];
          if ( otherView !== atomView ) {
            var bondAngleView = MoleculeShapesGlobals.useWebGL ?
                                new BondAngleWebGLView( this.renderer, this.model, this.molecule, otherView.group, atomView.group ) :
                                new BondAngleView( this.model, this.molecule, otherView.group, atomView.group );
            this.add( bondAngleView );
            this.angleViews.push( bondAngleView );
          }
        }
      }
    },

    removeGroup: function( group ) {
      var i;
      if ( group.isLonePair ) {
        for ( i = 0; i < this.lonePairViews.length; i++ ) {
          var lonePairView = this.lonePairViews[i];
          if ( lonePairView.group === group ) {
            this.remove( lonePairView );
            lonePairView.dispose();
            this.lonePairViews.splice( i, 1 );
            break;
          }
        }
      } else {
        for ( i = 0; i < this.atomViews.length; i++ ) {
          var atomView = this.atomViews[i];
          if ( atomView.group === group ) {
            this.remove( atomView );
            atomView.dispose();
            this.atomViews.splice( i, 1 );
            break;
          }
        }

        // reverse for ease of removal (we may need to remove multiple ones)
        for ( i = this.angleViews.length - 1; i >= 0; i-- ) {
          var bondAngleView = this.angleViews[i];

          if ( bondAngleView.aGroup === group || bondAngleView.bGroup === group ) {
            this.remove( bondAngleView );
            bondAngleView.dispose();
            this.angleViews.splice( i, 1 );
          }
        }
      }
      // remove from radialViews if it is included
      for ( i = 0; i < this.radialViews.length; i++ ) {
        if ( this.radialViews[i].group === group ) {
          this.radialViews.splice( i, 1 );
          break;
        }
      }
    },

    addBond: function( bond ) {
      assert && assert( bond.contains( this.molecule.centralAtom ) );
      var group = bond.getOtherAtom( this.molecule.centralAtom );

      if ( !group.isLonePair ) {
        var bondView = new BondView(
          this.renderer,
          bond,
          new Property( new Vector3() ), // center position
          group.positionProperty,
          0.5,
          this.molecule.getMaximumBondLength() );
        this.add( bondView );
        this.bondViews.push( bondView );
      }
    },

    removeBond: function( bond ) {
      for ( var i = this.bondViews.length - 1; i >= 0; i-- ) {
        var bondView = this.bondViews[i];
        if ( bondView.bond === bond ) {
          this.remove( bondView );
          this.bondViews.splice( i, 1 );
          bondView.dispose();
        }
      }
    }
  } );
} );