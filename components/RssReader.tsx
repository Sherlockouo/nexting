// components/RssReader.tsx
"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Link,
} from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { IconGitFork, IconLanguage, IconStar } from "@tabler/icons-react";

import { ProxyImage } from "./ProxyImage";
import { RepoMetadataCard } from "./rss/RepoMetaCard";

import { GitHubRepoItem } from "@/types/rss";

const RssReader = ({ feedItems }: { feedItems: GitHubRepoItem[] }) => {
  const [selectedItem, setSelectedItem] = useState<GitHubRepoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("feedItems: ", feedItems);
  const parseDescription = (description: string) => {
    const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
    const contentParts = description.split(/<br\s*\/?>/);

    return {
      image: imgMatch?.[1] || "",
      intro: contentParts[1]?.trim() || "",
      metadata: contentParts[2]?.trim() || "",
    };
  };

  const renderMetadata = (metadata: string) => {
    return metadata.split(/ \n?/).map((item, index) => {
      const [label, value] = item.split(": ");

      return (
        <div key={index} className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">{label}:</span>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {value}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        Trending GitHub Repositories
      </h2>

      <AnimatePresence>
        {feedItems.length === 0 ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="text-center text-gray-500"
            initial={{ opacity: 0 }}
          >
            No trending repositories found
          </motion.div>
        ) : (
          <motion.div
            animate="show"
            className="grid gap-6 md:grid-cols-2"
            initial="hidden"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
          >
            {feedItems.length > 0 &&
              feedItems.map((item) => {
                const { image, intro, metadata } = parseDescription(
                  item.description,
                );
                const [lang, stars, forks] = metadata.split(/ \n?/);

                return (
                  <motion.div
                    key={item.guid}
                    className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsModalOpen(true);
                    }}
                  >
                    {image && (
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                        <ProxyImage
                          alt={item.title}
                          className="w-full h-full object-cover"
                          src={image}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                        {item.title}
                      </h3>
                      {item.author && (
                        <p className="text-sm text-gray-500 mb-3">
                          Author: {item.author}
                        </p>
                      )}
                      {intro && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {intro}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {lang && <span>{lang}</span>}
                        {stars && <span>★ {stars.split(": ")[1]}</span>}
                        {forks && <span>⑂ {forks.split(": ")[1]}</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 增强版 Modal */}
      <Modal
        backdrop="blur"
        classNames={{
          body: "max-h-[70vh] overflow-y-auto",
          header: "border-b border-gray-200 dark:border-gray-700",
        }}
        isOpen={isModalOpen}
        size="3xl"
        onOpenChange={setIsModalOpen}
      >
        <ModalContent>
          {selectedItem &&
            (() => {
              const { image, intro, metadata } = parseDescription(
                selectedItem.description,
              );
              const [lang, stars, forks] = metadata.split(/ \n?/);

              return (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    <h3 className="text-2xl font-bold">{selectedItem.title}</h3>
                    {selectedItem.author && (
                      <p className="text-sm text-gray-500">
                        Author: {selectedItem.author}
                      </p>
                    )}
                  </ModalHeader>

                  <ModalBody>
                    {/* 大图预览 */}
                    {image && (
                      <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                        <ProxyImage
                          alt={selectedItem.title}
                          className="w-full h-full object-cover"
                          src={image}
                        />
                      </div>
                    )}

                    {/* 元数据网格 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <RepoMetadataCard
                        color="bg-purple-100 dark:bg-purple-900/50"
                        icon={<IconLanguage className="h-5 w-5" />}
                        label="Language"
                        value={lang?.split(": ")[1]}
                      />
                      <RepoMetadataCard
                        color="bg-yellow-100 dark:bg-yellow-900/50"
                        icon={<IconStar className="h-5 w-5" />}
                        label="Stars"
                        value={stars?.split(": ")[1]}
                      />
                      <RepoMetadataCard
                        color="bg-blue-100 dark:bg-blue-900/50"
                        icon={<IconGitFork className="h-5 w-5" />}
                        label="Forks"
                        value={forks?.split(": ")[1]}
                      />
                    </div>

                    {/* 详细描述 */}
                    <div className="space-y-4">
                      {intro && (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {intro}
                        </p>
                      )}
                      <div className="prose dark:prose-invert max-w-none" />
                      {selectedItem.description}
                    </div>
                  </ModalBody>

                  <ModalFooter className="flex justify-between">
                    <Button
                      color="primary"
                      variant="light"
                      onPress={() => setIsModalOpen(false)}
                    >
                      Close
                    </Button>
                    <Link
                      isExternal
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      href={selectedItem.link}
                    >
                      View on GitHub →
                    </Link>
                  </ModalFooter>
                </>
              );
            })()}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RssReader;
