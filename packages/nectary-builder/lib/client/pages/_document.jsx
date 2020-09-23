import React from 'react';

// script
const HeadScript = ({scripts}) => (<>{scripts.map((js) => <script src={js} key={js}/>)}</>);

// style
const HeadStyle = ({styles}) => (
  <>
    {styles.map((css) => (
      <link
        href={css}
        key={css}
        rel="stylesheet"
      />
    ))}
  </>
);

// store
const BodyStore = ({store, globalContent}) => {
  if (!store) return null;

  return (
    <script
      // eslint-disable-next-line
      dangerouslySetInnerHTML={{__html: `window.${globalContent}=${JSON.stringify(store)}`}}
    />
  );
};

export default ({App, Component, state, scripts, styles, globalId, globalContent}) => (
  <html>
  <head>
    <HeadScript scripts={scripts}/>
    <HeadStyle styles={styles}/>
  </head>
  <body>
  <div id={globalId}>
    <App Component={Component} pageProps={state}/>
  </div>
  <BodyStore store={state} globalContent={globalContent}/>
  </body>
  </html>
);
