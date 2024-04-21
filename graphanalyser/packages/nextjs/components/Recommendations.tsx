import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

export const RecommendationData = ({ addresses }: { addresses: string[] }) => {
  const [addressesCopied, setAddressesCopied] = useState(false);

  const addressesCopyButton = (
    <div className="mt-1 pl-2">
      {addressesCopied ? (
        <CheckCircleIcon
          className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
          aria-hidden="true"
        />
      ) : (
        <CopyToClipboard
          text={(addresses as string[]).join(", ")}
          onCopy={() => {
            setAddressesCopied(true);
            setTimeout(() => {
              setAddressesCopied(false);
            }, 800);
          }}
        >
          <DocumentDuplicateIcon
            className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
            aria-hidden="true"
          />
        </CopyToClipboard>
      )}
    </div>
  );

  const addressComponent = addresses.map(i => (
    <li key={i}>
      <pre className="mt-1">{i}</pre>
    </li>
  ));
  return (
    <div className="flex text-sm rounded-3xl peer-checked:rounded-b-none min-h-0 bg-primary py-0 mt-3">
      <div className="flex-wrap collapse collapse-arrow">
        <input type="checkbox" className="min-h-0 peer" />

        <div className="collapse-title text-sm min-h-0 py-1.5 pl-4">
          <strong>Show Recommended Followers</strong>
        </div>

        <div className="collapse-content overflow-auto bg-secondary rounded-t-none rounded-3xl">
          <div className="flex pt-4">
            {addressesCopyButton}
            <pre className="mt-1">Recommended followers:</pre>
          </div>
          <ul>{addressComponent}</ul>
        </div>
      </div>
    </div>
  );
};
