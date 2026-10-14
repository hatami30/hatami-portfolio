// Register <Callout> MDX component for Decap CMS
if (typeof window !== 'undefined' && window.CMS) {
  window.CMS.registerEditorComponent({
    id: 'callout',
    label: 'Callout',
    fields: [
      {
        name: 'type',
        label: 'Type',
        widget: 'select',
        options: ['info', 'warning', 'tip'],
        default: 'info',
      },
      {
        name: 'title',
        label: 'Title',
        widget: 'string',
        required: false,
      },
      {
        name: 'body',
        label: 'Content',
        widget: 'markdown',
      },
    ],
    pattern: /^<Callout(?:\s+type="([^"]*)")?(?:\s+title="([^"]*)")?>\n([\s\S]*?)\n<\/Callout>$/,
    fromBlock: function (match) {
      return {
        type: match[1] || 'info',
        title: match[2] || '',
        body: match[3] || '',
      };
    },
    toBlock: function (data) {
      const typeAttr = data.type ? ` type="${data.type}"` : '';
      const titleAttr = data.title ? ` title="${data.title}"` : '';
      return `<Callout${typeAttr}${titleAttr}>\n${data.body || ''}\n</Callout>`;
    },
    toPreview: function (data) {
      return `<div style="border-left: 4px solid #6366f1; padding: 12px 16px; background: rgba(99, 102, 241, 0.08); border-radius: 4px; margin: 16px 0;">
        ${data.title ? `<strong style="display:block; margin-bottom: 4px;">${data.title}</strong>` : ''}
        <div>${data.body || ''}</div>
      </div>`;
    },
  });
}
