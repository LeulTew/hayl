

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export function MarkdownText({ content, className = "" }: MarkdownTextProps) {
  if (!content) return null;

  return (
    <div className={`space-y-4 ${className}`}>
    <div className={`space-y-4 ${className}`}>
      {(() => {
        const lines = content.split('\n');
        const elements: React.ReactNode[] = [];
        let currentList: React.ReactNode[] = [];

        let currentParagraph: string[] = [];
        
        const flushParagraph = () => {
             if (currentParagraph.length > 0) {
                 const text = currentParagraph.join(' ');
                 if (text.trim()) {
                     elements.push(
                         <p key={`p-${elements.length}`} className="text-sm leading-relaxed text-hayl-muted font-sans font-medium" 
                            dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-hayl-text font-bold">$1</strong>') }} 
                         />
                     );
                 }
                 currentParagraph = [];
             }
        };

        const flushList = () => {
            if (currentList.length > 0) {
                elements.push(
                    <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-2 text-hayl-muted font-sans text-sm">
                        {currentList}
                    </ul>
                );
                currentList = [];
            }
        };

        const flushAll = () => {
            flushParagraph();
            flushList();
        };

        lines.forEach((rawLine, i) => {
             const line = rawLine.trim();
             
             // Empty / Spacer
             if (!line) {
                 flushAll();
                 return;
             }

             // Headers
             if (line.startsWith('# ')) {
                 flushAll();
                 elements.push(
                     <h3 key={`h3-${i}`} className="text-xl md:text-2xl font-heading font-bold uppercase mb-2 mt-6 text-hayl-text first:mt-0 break-words leading-tight">
                         {line.replace('# ', '')}
                     </h3>
                 );
                 return;
             }
             if (line.startsWith('## ')) {
                 flushAll();
                 elements.push(
                     <h4 key={`h4-${i}`} className="text-lg md:text-xl font-heading font-bold uppercase mb-2 mt-4 text-hayl-text break-words">
                         {line.replace('## ', '')}
                     </h4>
                 );
                 return;
             }

             // List Items
             if (line.startsWith('- ')) {
                 flushParagraph(); // Lists break paragraphs
                 currentList.push(
                     <li key={`li-${i}`}>
                         <span dangerouslySetInnerHTML={{ 
                             __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-hayl-text font-bold">$1</strong>') 
                         }} />
                     </li>
                 );
                 return;
             }

             // Paragraph text
             flushList(); // Text breaks lists
             currentParagraph.push(line);
        });
        
        flushAll();
        return elements;
      })()}
    </div>
    </div>
  );
}
