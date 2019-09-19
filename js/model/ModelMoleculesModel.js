// Copyright 2014-2019, University of Colorado Boulder

/**
 * Model for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesModel = require( 'MOLECULE_SHAPES/common/model/MoleculeShapesModel' );
  const PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  const Property = require( 'AXON/Property' );
  const Vector3 = require( 'DOT/Vector3' );
  const VSEPRMolecule = require( 'MOLECULE_SHAPES/common/model/VSEPRMolecule' );

  /**
   * @constructor
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  function ModelMoleculesModel( isBasicsVersion ) {
    var self = this;

    var initialMolecule = new VSEPRMolecule();

    MoleculeShapesModel.call( this, isBasicsVersion );
    this.moleculeProperty = new Property( initialMolecule );

    this.moleculeProperty.get().addCentralAtom( new PairGroup( new Vector3( 0, 0, 0 ), false ) );
    this.setupInitialMoleculeState();

    // when the molecule is made empty, make sure to show lone pairs again (will allow us to drag out new ones)
    this.moleculeProperty.get().on( 'bondChanged', function() {
      if ( self.moleculeProperty.get().radialLonePairs.length === 0 ) {
        self.showLonePairsProperty.set( true );
      }
    } );
  }

  moleculeShapes.register( 'ModelMoleculesModel', ModelMoleculesModel );

  return inherit( MoleculeShapesModel, ModelMoleculesModel, {
    /**
     * @private
     */
    setupInitialMoleculeState: function() {
      // start with two single bonds
      var centralAtom = this.moleculeProperty.get().centralAtom;
      this.moleculeProperty.get().addGroupAndBond( new PairGroup( new Vector3( 8, 0, 3 ).setMagnitude( PairGroup.BONDED_PAIR_DISTANCE ), false ), centralAtom, 1 );
      this.moleculeProperty.get().addGroupAndBond( new PairGroup( new Vector3( 2, 8, -5 ).setMagnitude( PairGroup.BONDED_PAIR_DISTANCE ), false ), centralAtom, 1 );
    },

    // @override
    reset: function() {
      MoleculeShapesModel.prototype.reset.call( this );

      this.moleculeProperty.reset();

      this.moleculeProperty.get().removeAllGroups();
      this.setupInitialMoleculeState();
    }
  } );
} );
