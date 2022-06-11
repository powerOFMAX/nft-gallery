/* eslint-disable @next/next/no-img-element */
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletNfts, NftTokenAccount } from '@nfteyez/sol-rayz-react';
import { useEffect, useState } from 'react';

export const GalleryView = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [images, setImages] = useState<{
    [key: string]: Array<NftTokenAccount>;
  }>({});

  const { isLoading, error, nfts } = useWalletNfts({
    publicAddress: publicKey?.toBase58() ?? '',
    connection,
  });

  const fetchMetadata = async (nftArray: Array<NftTokenAccount>) => {
    let metadatas: Array<NftTokenAccount> = [];
    for (const nft of nftArray) {
      try {
        await fetch(nft.data.uri)
          .then((response) => response.json())
          .then((meta) => {
            metadatas.push({ ...meta, ...nft });
          });
      } catch (error) {
        console.log(error);
      }
    }
    return metadatas;
  };

  useEffect(() => {
    const handleNftImages = async () => {
      if (nfts.length > 0 && !isLoading && publicKey) {
        const metadatas = await fetchMetadata(nfts);
        let group: { [key: string]: Array<NftTokenAccount> } = {};
        for (const nft of metadatas) {
          if (group.hasOwnProperty(nft.data.symbol)) {
            group[nft.data.symbol].push(nft);
          } else {
            group[nft.data.symbol] = [nft];
          }
        }
        setImages(group);
      }
    };

    handleNftImages();
  }, [publicKey, nfts, isLoading]);

  if (!publicKey) return <></>;
  if (error === true) return <div>Have some error</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="content-center grid gap-8 py-5 grid-cols-1 md:grid-cols-3">
      {Object.keys(images).map((metadata) =>
        images[metadata].map((nft: any) => {
          return (
            <img
              className='rounded-lg shadow-lg'
              loading='lazy'
              key={nft.name}
              width={400}
              height={400}
              src={nft.image}
              alt={nft.name}
            />
          );
        })
      )}
    </div>
  );
};
