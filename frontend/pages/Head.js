import Head from "next/head";

const PageHead = ({ title }) => {
  return (
    <>
      <Head>
        <title>{`${title} || WeAI`}</title>
        <meta name="description" content="Reseacrh (Demo)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  );
};

export default PageHead;
