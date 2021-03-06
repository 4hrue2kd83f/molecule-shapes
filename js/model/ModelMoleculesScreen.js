// Copyright 2014-2020, University of Colorado Boulder

/**
 * The first (model) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MoleculeShapesColorProfile from '../common/view/MoleculeShapesColorProfile.js';
import ScreenIconNode from '../common/view/ScreenIconNode.js';
import moleculeShapes from '../moleculeShapes.js';
import moleculeShapesStrings from '../moleculeShapesStrings.js';
import ModelMoleculesModel from './ModelMoleculesModel.js';
import ModelMoleculesScreenView from './ModelMoleculesScreenView.js';

class ModelMoleculesScreen extends Screen {

  /**
   * Creates the model and view for the ModelMoleculesScreen
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  constructor( isBasicsVersion ) {
    const options = {
      name: moleculeShapesStrings.screen.model,
      backgroundColorProperty: MoleculeShapesColorProfile.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new ScreenIconNode( true, isBasicsVersion ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } )
    };

    super(
      function() { return new ModelMoleculesModel( isBasicsVersion ); },
      function( model ) { return new ModelMoleculesScreenView( model ); },
      options
    );
  }
}

moleculeShapes.register( 'ModelMoleculesScreen', ModelMoleculesScreen );
export default ModelMoleculesScreen;