import React from "react";

interface TextFormatterProps {
  description: string;
}

const renderTextContent = (content: any[], parentKey: string) => {
  return content.map((textBlock: any, index: number) => {
    if (!textBlock.text && !textBlock.content) return null;

    let text = textBlock.text || "";

    // Handle nested marks
    if (textBlock.marks) {
      textBlock.marks.forEach((mark: any) => {
        switch (mark.type) {
          case "bold":
            text = <strong key={`${parentKey}-bold-${index}`}>{text}</strong>;
            break;
          case "italic":
            text = <em key={`${parentKey}-italic-${index}`}>{text}</em>;
            break;
          case "underline":
            text = <u key={`${parentKey}-underline-${index}`}>{text}</u>;
            break;
          case "link":
            text = (
              <a
                key={`${parentKey}-link-${index}`}
                href={mark.attrs?.href}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {text}
              </a>
            );
            break;
        }
      });
    }

    return <span key={`${parentKey}-text-${index}`}>{text}</span>;
  });
};

const extractFormattedText = (description: string) => {
  if (!description) return "No description available";

  try {
    const parsed = JSON.parse(description);

    if (typeof parsed === "string") {
      return <p>{parsed}</p>;
    }

    if (parsed.type === "doc" && Array.isArray(parsed.content)) {
      return parsed.content.map((block: any, blockIndex: number) => {
        const blockKey = `block-${blockIndex}`;

        switch (block.type) {
          case "paragraph":
            return block.content ? (
              <p key={blockKey} className="mb-4">
                {renderTextContent(block.content, blockKey)}
              </p>
            ) : null;

          case "bulletList":
            return (
              <ul key={blockKey} className="list-disc ml-6 mb-4 space-y-2">
                {block.content?.map((listItem: any, listIndex: number) => (
                  <li key={`${blockKey}-item-${listIndex}`}>
                    {listItem.content?.[0]?.content &&
                      renderTextContent(
                        listItem.content[0].content,
                        `${blockKey}-item-${listIndex}`
                      )}
                  </li>
                ))}
              </ul>
            );

          case "orderedList":
            return (
              <ol key={blockKey} className="list-decimal ml-6 mb-4 space-y-2">
                {block.content?.map((listItem: any, listIndex: number) => (
                  <li key={`${blockKey}-item-${listIndex}`}>
                    {listItem.content?.[0]?.content &&
                      renderTextContent(
                        listItem.content[0].content,
                        `${blockKey}-item-${listIndex}`
                      )}
                  </li>
                ))}
              </ol>
            );

          case "heading":
            if (!block.content) return null;
            return (
              <h2 key={blockKey} className="text-2xl font-bold my-4">
                {renderTextContent(block.content, blockKey)}
              </h2>
            );

          case "image":
            return (
              <img
                key={blockKey}
                src={block.attrs?.src}
                alt={block.attrs?.alt || ""}
                className="my-4 max-w-full h-auto rounded-lg shadow-md"
              />
            );

          default:
            return null;
        }
      });
    }
  } catch (e) {
    console.error("Error parsing description:", e);
    return <p>{description}</p>;
  }
};

export default function TextFormatter({ description }: TextFormatterProps) {
  const formattedDescription = extractFormattedText(description);
  return <div>{formattedDescription}</div>;
}
