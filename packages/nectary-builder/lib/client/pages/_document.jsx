import React from 'react';
import devalue from 'devalue';

const RenderJudge = ({value, active, inactive}) => (value ? active : inactive);
RenderJudge.defaultProps = {
  value: true,
  active: null,
  inactive: null
};

// script
const Script = ({data}) => (
  <>
    {data.map((src) => (
      <script
        src={src}
        key={src}
        type="text/javascript"
        defer
      />
    ))}
  </>
);

// style
const LinkStyle = ({data}) => (
  <>
    {data.map((href) => (
      <link
        href={href}
        key={href}
        rel="stylesheet"
      />
    ))}
  </>
);

// state
const State = ({data, context}) => (
  <RenderJudge
    value={!!data}
    active={(
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{__html: `window.${context}=${devalue(data)}`}}
      />
    )}
  />
);

const Document = ({body, pageScripts, pageStyles, state, helmet, context, id}) => (
  <html {...helmet.htmlAttributes.toComponent()}>
  <head>
    {helmet.base.toComponent()}
    {helmet.title.toComponent()}
    {helmet.meta.toComponent()}
    {helmet.link.toComponent()}
    {helmet.style.toComponent()}
    <LinkStyle data={pageStyles}/>
    {helmet.noscript.toComponent()}
  </head>
  <body {...helmet.bodyAttributes.toComponent()}>
  <div id={id} dangerouslySetInnerHTML={{__html: body}}/>

  <State data={state} context={context}/>
  <Script data={pageScripts}/>
  {helmet.script.toComponent()}
  </body>
  </html>
);

export default Document;
