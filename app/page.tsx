"use client";

import { CardHeader, CardBody, Card, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="flex gap-20 justify-around items-center">
        <Card>
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">Daily Mix</p>
            <small className="text-default-500">12 Tracks</small>
            <h4 className="font-bold text-large">Frontend Radio</h4>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <Button
              color="primary"
              onPress={() => {
                router.push("/chat");
              }}
            >
              Chat with text
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <p className="text-tiny uppercase font-bold">Daily Mix</p>
            <small className="text-default-500">12 Tracks</small>
            <h4 className="font-bold text-large">Frontend Radio</h4>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <Button
              color="primary"
              onPress={() => {
                router.push("/talk");
              }}
            >
              Chat with voice
            </Button>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
