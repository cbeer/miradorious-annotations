import './index.css'
import Mirador from 'mirador'
import { useContext, useState, useEffect } from 'react';
import { Annotorious, OpenSeadragonAnnotator, OpenSeadragonAnnotatorContext, UserSelectAction, useAnnotator, useSelection } from '@annotorious/react'
import '@annotorious/react/annotorious-react.css';

const miradorConfig = {
  windows: [{
    manifestId: 'https://iiif.io/api/cookbook/recipe/0021-tagging/manifest.json',
    // thumbnailNavigationPosition: 'bottom',
    allowClose: false,
  }]
}

const AnnotoriousContextPlugin = ({children}) => {
  return <Annotorious>{children}</Annotorious>
}

const AnnotoriousOsdAnnotatorPlugin = ({children}) => {
  const [tool, setTool] = useState();
  const anno = useAnnotator();
  const selection = useSelection();

  useEffect(() => {
    if (!anno) return;

    anno.setAnnotations([]);

    return () => {
      anno.clearAnnotations();
    }
  }, [anno]);

  const onDelete = (ids) =>
    ids.forEach(id => anno.removeAnnotation(id));


  return <OpenSeadragonAnnotator userSelectAction={UserSelectAction.EDIT} drawingEnabled={tool !== undefined} tool={tool || 'rectangle'}>
    <>{children}</>
    <div className='actions' style={{ position: 'absolute', top: 0, right: 0}}>
          <div>
            <button
              className={tool === undefined ? 'active' : undefined}
              onClick={() => setTool(undefined)}>
               Move
            </button>

            <button
              className={tool === 'rectangle' ? 'rectangle active' : 'rectangle'}
              onClick={() => setTool('rectangle')}>
               Rectangle
            </button>

            <button
              className={tool === 'polygon' ? 'polygon active' : 'polygon'}
              onClick={() => setTool('polygon')}>
               Polygon
            </button>
          </div>

          <div>
            {selection.selected.length > 0 && (
              <button onClick={() => onDelete(selection.selected.map(s => s.annotation.id))}>
                Trash
              </button>
            )}
          </div>
        </div></OpenSeadragonAnnotator>
};

const AnnotoriousViewerIntegrationPlugin = (props) => {
  const { viewer, setViewer } = useContext(OpenSeadragonAnnotatorContext);

  useEffect(() => {  
    if (props.viewer && (props.viewer !== viewer)) {
      setViewer(props.viewer);
    }    
  }, [props.viewer, setViewer]);

  return <></>;
}

const plugins = [
  {
    component: AnnotoriousContextPlugin,
    mode: 'wrap',
    target: 'Window'
  },
  {
    component: AnnotoriousOsdAnnotatorPlugin,
    mode: 'wrap',
    target: 'WindowViewer'
  },
  {
    component: AnnotoriousViewerIntegrationPlugin,
    mode: 'add',
    target: 'OpenSeadragonViewer'
  }
];

Mirador.viewer({ id: 'root', ...miradorConfig}, { plugins: plugins })
